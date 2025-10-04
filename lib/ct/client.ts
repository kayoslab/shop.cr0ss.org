import {
  ClientBuilder,
  type HttpMiddlewareOptions,
  type AuthMiddlewareOptions,
} from '@commercetools/sdk-client-v2';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';

const projectKey = process.env.CT_PROJECT_KEY!;
const clientId = process.env.CT_CLIENT_ID!;
const clientSecret = process.env.CT_CLIENT_SECRET!;
const authUrl = process.env.CT_AUTH_URL!;
const apiUrl = process.env.CT_API_URL!;

// Use least-privilege scopes for read-only catalog
const scopes = (process.env.CT_SCOPES || `view_products:${projectKey}`).split(' ');

const authOptions: AuthMiddlewareOptions = {
  host: authUrl,
  projectKey,
  credentials: { clientId, clientSecret },
  scopes,
  fetch,
};

const httpOptions: HttpMiddlewareOptions = {
  host: apiUrl,
  fetch,
};

const ctpClient = new ClientBuilder()
  .withProjectKey(projectKey)
  .withClientCredentialsFlow(authOptions)  // <-- server app flow
  .withHttpMiddleware(httpOptions)
  .build();

export const apiRootApp = createApiBuilderFromCtpClient(ctpClient).withProjectKey({ projectKey });
