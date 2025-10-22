import { ClientBuilder } from '@commercetools/sdk-client-v2';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';

const projectKey   = process.env.CT_PROJECT_KEY!;
const authUrl      = process.env.CT_AUTH_URL!;
const apiUrl       = process.env.CT_API_URL!;
const clientId     = process.env.CT_CLIENT_ID!;
const clientSecret = process.env.CT_CLIENT_SECRET!;

const scopes: string[] = [
  'view_categories:shop-cr0ss',
  'view_tax_categories:shop-cr0ss',
  'manage_order_edits:shop-cr0ss',
  'view_shipping_methods:shop-cr0ss',
  'create_anonymous_token:shop-cr0ss',
  'manage_customers:shop-cr0ss',
  'manage_my_orders:shop-cr0ss',
  'manage_shopping_lists:shop-cr0ss',
  'view_discount_codes:shop-cr0ss',
  'view_products:shop-cr0ss',
  'view_product_selections:shop-cr0ss',
  'view_published_products:shop-cr0ss',
  'view_cart_discounts:shop-cr0ss',
  'view_project_settings:shop-cr0ss',
  'view_types:shop-cr0ss',
  'view_sessions:shop-cr0ss',
  'manage_sessions:shop-cr0ss',
  'manage_orders:shop-cr0ss',
  'view_standalone_prices:shop-cr0ss',
];

const ctpClient = new ClientBuilder()
  .withClientCredentialsFlow({
    host: authUrl,
    projectKey,
    credentials: { clientId, clientSecret },
    scopes,
  })
  .withHttpMiddleware({
    host: apiUrl,
  })
  .build();

export const apiRootApp = createApiBuilderFromCtpClient(ctpClient).withProjectKey({ projectKey });
