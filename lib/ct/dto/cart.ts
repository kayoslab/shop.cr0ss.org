export type MoneyDTO = {
  currencyCode: string;
  centAmount: number;
  discounted?: boolean;
  discountedCentAmount?: number;
};

export type CartLineItemDTO = {
  id: string;
  productId: string;
  name: string;
  imageUrl?: string;
  variantId?: number;
  sku?: string;
  quantity: number;
  unitPrice?: MoneyDTO;
  lineTotal?: MoneyDTO;
};

export type CartDTO = {
  id: string;
  version: number;
  currency: string;
  country?: string;
  subtotal?: MoneyDTO;
  total?: MoneyDTO;
  lineItems: CartLineItemDTO[];
};
