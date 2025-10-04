import type { TokenCache, TokenStore } from '@commercetools/sdk-client-v2';

export function inMemoryTokenCache(): TokenCache {
  // Always hold a TokenStore (can start empty)
  let store: TokenStore = {
      token: '',
      expirationTime: 0
  };

  return {
    get: () => store,
    set: (tok: TokenStore) => {
      store = tok;
    },
  };
}
