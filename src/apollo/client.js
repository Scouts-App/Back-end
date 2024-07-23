const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { HttpLink } = require('apollo-link-http');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { sourceDexType } = require('../constants/enum');

const GlobalConst = {
  SYNC_SWAP: 'https://api.studio.thegraph.com/query/76206/zksync-syncswap-classic/v1.0.3',
  ZK_SWAP: 'https://api.studio.thegraph.com/query/76206/zksync-zkswap/v1.0.1',
  KOI_FINANCE: 'https://api.studio.thegraph.com/query/76206/zksync-koiv2/v1.0.1',
  GRAPH_BLOCK: process.env.GRAPH_BLOCK,
};

const syncSwapClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: GlobalConst.SYNC_SWAP,
      fetch,
    }),
    cache: new InMemoryCache(),
    // shouldBatch: true,
  });
};

const zkSwapClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: GlobalConst.ZK_SWAP,
      fetch,
    }),
    cache: new InMemoryCache(),
    // shouldBatch: true,
  });
};

const koiFinanceClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: GlobalConst.KOI_FINANCE,
      fetch,
    }),
    cache: new InMemoryCache(),
    // shouldBatch: true,
  });
};

const txClient = (dexType) => {
  let result;

  switch (dexType) {
    case sourceDexType.SYNC_SWAP: result = new ApolloClient({
      link: new HttpLink({
        uri: GlobalConst.SYNC_SWAP,
        fetch,
      }),
      cache: new InMemoryCache(),
      // shouldBatch: true,
    });
      break;

    case sourceDexType.KOI_FINANCE: result = new ApolloClient({
      link: new HttpLink({
        uri: GlobalConst.KOI_FINANCE,
        fetch,
      }),
      cache: new InMemoryCache(),
      // shouldBatch: true,
    });
      break;

    case sourceDexType.ZK_SWAP: result = new ApolloClient({
      link: new HttpLink({
        uri: GlobalConst.ZK_SWAP,
        fetch,
      }),
      cache: new InMemoryCache(),
      // shouldBatch: true,
    });
      break;
  }
  return result;
};

const blockClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: GlobalConst?.GRAPH_BLOCK,
    }),
    cache: new InMemoryCache(),
    // shouldBatch: true,
  });
};

module.exports = { syncSwapClient, zkSwapClient, koiFinanceClient, txClient, blockClient };
