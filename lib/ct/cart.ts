import { apiRootApp } from './client';
import type {
  Cart,
  CartUpdateAction,
  ProductVariant,
} from '@commercetools/platform-sdk';
import type { CartDTO, CartLineItemDTO, MoneyDTO } from './dto/cart';
import error from 'next/error';

const MAX_RETRIES = 3;

function moneyToDTO(m?: { centAmount: number; currencyCode: string } | null): MoneyDTO | undefined {
  if (!m) return undefined;
  return { currencyCode: m.currencyCode, centAmount: m.centAmount };
}

export function mapCartToDTO(cart: Cart, locale: string): CartDTO {
  const toName = (li: Cart['lineItems'][number]): string => {
    const nm = li.name;
    if (!nm) return '';
    return nm[locale] ?? Object.values(nm)[0] ?? '';
  };

  const toImg = (variant?: ProductVariant) => {
    const url = variant?.images?.[0]?.url;
    if (!url) return undefined;
    return url.startsWith('//') ? `https:${url}` : url;
  };

  const lineItems: CartLineItemDTO[] = (cart.lineItems ?? []).map((li) => {
    const price = li.price?.value ?? li.price?.discounted?.value;
    return {
      id: li.id,
      productId: li.productId,
      name: toName(li),
      imageUrl: toImg(li.variant),
      variantId: li.variant?.id,
      sku: li.variant?.sku,
      quantity: li.quantity,
      unitPrice: moneyToDTO(price) && {
        currencyCode: price!.currencyCode,
        centAmount: price!.centAmount,
        discounted: Boolean(li.price?.discounted?.value),
        discountedCentAmount: li.price?.discounted?.value?.centAmount,
      },
      lineTotal: moneyToDTO(li.totalPrice),
    };
  });

  return {
    id: cart.id,
    version: cart.version,
    currency: cart.totalPrice?.currencyCode ?? '',
    country: cart.country,
    subtotal: moneyToDTO(cart?.taxedPrice?.totalNet ?? cart.totalPrice),
    total: moneyToDTO(cart.totalPrice),
    lineItems,
  };
}

export async function getCartById(cartId: string) {
  const res = await apiRootApp.carts().withId({ ID: cartId }).get().execute();
  return res.body;
}

export async function createAnonymousCart(args: {
  currency: string;
  country?: string;
  locale?: string;
}) {
  const res = await apiRootApp
    .carts()
    .post({
      body: {
        currency: args.currency,
        country: args.country,
        locale: args.locale,
      },
    })
    .execute();
  return res.body;
}

async function updateCartOnce(cartId: string, version: number, actions: CartUpdateAction[]) {
  const res = await apiRootApp
    .carts()
    .withId({ ID: cartId })
    .post({ body: { version, actions } })
    .execute();
  return res.body;
}

export async function updateCartWithRetry(
  cartId: string,
  version: number,
  actions: CartUpdateAction[]
) {
  let v = version;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await updateCartOnce(cartId, v, actions);
    } catch (e: unknown) {
      const err = e as { statusCode?: number; code?: number } | null;
      if (err?.statusCode === 409 || err?.code === 409) {
        const latest = await getCartById(cartId);
        v = latest.version;
        continue;
      }
      throw e;
    }
  }
  // final attempt
  return await updateCartOnce(cartId, v, actions);
}

export async function addLineItem(
  cartId: string,
  version: number,
  args: { productId: string; variantId?: number; sku?: string; quantity?: number }
) {
  const actions: CartUpdateAction[] = [
    {
      action: 'addLineItem',
      productId: args.productId,
      ...(args.variantId ? { variantId: args.variantId } : {}),
      ...(args.sku ? { sku: args.sku } : {}),
      quantity: args.quantity ?? 1,
    },
  ];
  return updateCartWithRetry(cartId, version, actions);
}

export async function changeLineItemQuantity(
  cartId: string,
  version: number,
  lineItemId: string,
  quantity: number
) {
  const actions: CartUpdateAction[] = [
    { action: 'changeLineItemQuantity', lineItemId, quantity },
  ];
  return updateCartWithRetry(cartId, version, actions);
}

export async function removeLineItem(
  cartId: string,
  version: number,
  lineItemId: string
) {
  const actions: CartUpdateAction[] = [{ action: 'removeLineItem', lineItemId }];
  return updateCartWithRetry(cartId, version, actions);
}
