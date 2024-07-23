const gql = require('graphql-tag');

exports.TOKEN_SEARCH = gql`
  query tokens($value: String, $id: String) {
    asSymbol: tokens(where: { symbol_contains: $value }, orderBy: totalLiquidity, orderDirection: desc) {
      id
      symbol
      name
      decimals
      totalVolumeUSD
      totalLiquidity
    }
    asName: tokens(where: { name_contains: $value }, orderBy: totalLiquidity, orderDirection: desc) {
      id
      symbol
      name
      decimals
      totalVolumeUSD
      totalLiquidity
    }
    asAddress: tokens(where: { id: $id }, orderBy: totalLiquidity, orderDirection: desc) {
      id
      symbol
      name
      decimals
      totalVolumeUSD
      totalLiquidity
    }
  }
`;

exports.PAIR_SEARCH = gql`
  query pools($tokens: [String!], $id: String) {
    as0: pools(where: { token0_in: $tokens }) {
      id
      reserveQuote
      token0 {
        id
        symbol
        decimals
        name
      }
      token1 {
        id
        symbol
        decimals
        name
      }
    }
    as1: pools(where: { token1_in: $tokens }) {
      id
      reserveQuote
      token0 {
        id
        symbol
        decimals
        name
      }
      token1 {
        id
        symbol
        decimals
        name
      }
    }
    asAddress: pools(where: { id: $id }) {
      id
      reserveQuote
      token0 {
        id
        symbol
        decimals
        name
      }
      token1 {
        id
        symbol
        decimals
        name
      }
    }
  }
`;

exports.TOKEN_CHART = gql`
  query tokenDayDatas($tokenAddr: String!, $startTime: Int!) {
    tokenDayDatas(first: 1000, orderBy: date, orderDirection: desc, where: { token: $tokenAddr, date_gt: $startTime }) {
      id
      date
      priceUSD
      totalLiquidity
      totalLiquidityUSD
      totalLiquidityQuote
      dailyVolumeQuote
      dailyVolumeToken
      dailyVolumeUSD
    }
  }
`;

exports.PAIR_CHART = gql`
  query poolDayDatas($poolAddress: String!, $skip: Int!, $startTime: Int!) {
    poolDayDatas(
      first: 1000
      skip: $skip
      orderBy: date
      orderDirection: asc
      where: { poolAddress: $poolAddress, date_gt: $startTime }
    ) {
      id
      date
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      reserveUSD
      reserveQuote
    }
  }
`;

exports.HOURLY_PAIR_RATES = (poolAddress, blocks) => {
  let queryString = 'query blocks {';
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}: pool(id:"${poolAddress}", block: { number: ${block.number} }) { 
        token0Price
        token1Price
      }
    `
  );

  queryString += '}';
  return gql(queryString);
};

const PairFields = `
  fragment PairFields on Pool {
    id
    reserve0
    reserve1
    volumeUSD
    reserveUSD
    reserveQuote
    token0 {
      symbol
      id
      decimals
      derivedQuote
    }
    token1 {
      symbol
      id
      decimals
      derivedQuote
    }
  }
`;

exports.PAIRS_CURRENT = (count) => {
  const queryString = `
  query pools {
    pools(first: ${count}, orderBy: exchange__totalVolumeUSD, orderDirection: desc) {
      id
    }
  }`;
  return gql(queryString);
};

exports.PAIRS_BULK = (pools) => {
  let poolsString = `[`;
  pools.map((pool) => {
    return (poolsString += `"${pool.toLowerCase()}"`);
  });
  poolsString += ']';
  const queryString = `
  ${PairFields}
  query pools {
    pools(first: ${pools.length}, where: { id_in: ${poolsString} }, orderBy: exchange__totalVolumeUSD, orderDirection: desc) {
      ...PairFields
    }
  }
  `;
  return gql(queryString);
};

exports.ALL_TOKENS = gql`
  query tokens($skip: Int!) {
    tokens(first: 10, skip: $skip) {
      id
      name
      symbol
      decimals
      totalVolumeUSD
      totalVolume
      totalLiquidity
    }
  }
`;

exports.ALL_PAIRS = gql`
  query pools($skip: Int!) {
    pools(first: 10, skip: $skip, orderBy: exchange__totalVolumeUSD, orderDirection: desc) {
      id
      token0 {
        id
        symbol
        name
        decimals
      }
      token1 {
        id
        symbol
        name
        decimals
      }
    }
  }
`;

exports.PAIRS_BULK1 = gql`
  ${PairFields}
  query pools($allPairs: [String!]) {
    pools(
      first: 500
      where: { id_in: $allPairs }
      orderBy: reserveQuote
      orderDirection: desc
    ) {
      ...PairFields
    }
  }
`;

const TokenFields = `
  fragment TokenFields on Token {
    id
    name
    symbol
    decimals
    derivedQuote
    totalVolume
    totalVolumeUSD
    totalLiquidity
  }
`;

exports.TOKENS_CURRENT = (count) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(first: ${count}, orderBy: totalVolumeUSD, orderDirection: desc) {
        ...TokenFields
      }
    }
  `;
  return gql(queryString);
};

exports.TOKEN_INFO = (address) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(first: 1, where: {id: "${address.toLowerCase()}"}) {
        ...TokenFields
      }
    }
  `;
  return gql(queryString);
};

exports.TOKEN_INFO_OLD = (block, address) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(block: {number: ${block}} first: 1, where: {id: "${address.toLowerCase()}"}) {
        ...TokenFields
      }
    }
  `;
  return gql(queryString);
};

exports.TOKENS_DYNAMIC = (block, count) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(block: {number: ${block}} first: ${count}, orderBy: totalVolumeUSD, orderDirection: desc) {
        ...TokenFields
      }
    }
  `;
  return gql(queryString);
};

exports.TOKEN_DATA = (tokenAddress, block) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(${block ? `block : {number: ${block}}` : ``} where: {id:"${tokenAddress}"}) {
        ...TokenFields
      }
      pools0: pools(where: {token0: "${tokenAddress}"}, first: 50, orderBy: reserveUSD, orderDirection: desc){
        id
      }
      pools1: pools(where: {token1: "${tokenAddress}"}, first: 50, orderBy: reserveUSD, orderDirection: desc){
        id
      }
    }
  `;
  return gql(queryString);
};

exports.PAIR_ID = (tokenAddress0, tokenAddress1) => {
  const queryString = `
    query tokens {
      pools0: pools(where: {token0: "${tokenAddress0}", token1: "${tokenAddress1}"}){
        id
      }
      pools1: pools(where: {token0: "${tokenAddress1}", token1: "${tokenAddress0}"}){
        id
      }
    }
  `;
  return gql(queryString);
};

exports.IS_PAIR_EXISTS = (poolAddress) => {
  const queryString = `
    query pools {
      pool(id: "${poolAddress}"){
        id
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  `;
  return gql(queryString);
};

exports.IS_TOKEN_EXISTS = (tokenAddress) => {
  const queryString = `
    query tokens {
      token(id: "${tokenAddress}"){
        id
      }
    }
  `;
  return gql(queryString);
};

exports.TOKEN_DATA1 = (tokenAddress, tokenAddress1) => {
  const queryString = `
    query tokens {
      pools0: pools(where: {token0: "${tokenAddress}", token1: "${tokenAddress1}"}){
        id
        token0 {
          id
        }
        token1{
          id
        }
      }
      pools1: pools(where: {token0: "${tokenAddress}", token1_not: "${tokenAddress1}"}, first: 2, orderBy: reserveQuote, orderDirection: desc){
        id
        token0 {
          id
        }
        token1{
          id
        }
      }
      pools2: pools(where: {token1: "${tokenAddress}", token0_not: "${tokenAddress1}"}, first: 2, orderBy: reserveQuote, orderDirection: desc){
        id
        token0 {
          id
        }
        token1{
          id
        }
      }
      pools3: pools(where: {token0: "${tokenAddress1}", token1_not: "${tokenAddress}"}, first: 2, orderBy: reserveQuote, orderDirection: desc){
        id
        token0 {
          id
        }
        token1{
          id
        }
      }
      pools4: pools(where: {token1: "${tokenAddress1}", token0_not: "${tokenAddress}"}, first: 2, orderBy: trackedReserveETH, orderDirection: desc){
        id
        token0 {
          id
        }
        token1{
          id
        }
      }
    }
  `;
  return gql(queryString);
};

exports.TOKEN_DATA2 = (tokenAddress) => {
  const queryString = `
    query tokens {
      pools0: pools(where: {token0: "${tokenAddress}"}, first: 50, orderBy: reserveQuote, orderDirection: desc){
        id
      }
      pools1: pools(where: {token1: "${tokenAddress}"}, first: 50, orderBy: reserveQuote, orderDirection: desc){
        id
      }
    }
  `;
  return gql(queryString);
};

exports.PAIR_DATA = (poolAddress, block) => {
  const queryString = `
    ${PairFields}
    query pools {
      pools(${block ? `block: {number: ${block}}` : ``} where: { id: "${poolAddress}"} ) {
        ...PairFields
      }
    }`;
  return gql(queryString);
};

exports.PAIRS_HISTORICAL_BULK = (block, pools) => {
  let poolsString = `[`;
  pools.map((pool) => {
    return (poolsString += `"${pool.toLowerCase()}"`);
  });
  poolsString += ']';
  const queryString = `
  query pools {
    pools(first: ${pools.length}, where: {id_in: ${poolsString}}, block: {number: ${block}}, orderBy: volumeUSD, orderDirection: desc) {
      id
      reserveUSD
      volumeUSD
    }
  }
  `;
  return gql(queryString);
};

exports.GLOBAL_CHART = gql`
  query exchangeDayDatas($startTime: Int!, $skip: Int!) {
    exchangeDayDatas(
      first: 500
      skip: $skip
      where: { date_gt: $startTime }
      orderBy: date
      orderDirection: asc
    ) {
      id
      date
      totalVolumeUSD
      dailyVolumeUSD
      dailyVolumeQuote
      totalLiquidityUSD
      totalLiquidityQuote
    }
  }
`;

exports.GET_BLOCK = gql`
  query blocks($timestampFrom: Int!, $timestampTo: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
    ) {
      id
      number
      timestamp
    }
  }
`;

exports.GET_BLOCKS = (timestamps) => {
  let queryString = 'query blocks {';
  queryString += timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${timestamp + 600
      } }) {
      number
    }`;
  });
  queryString += '}';
  return gql(queryString);
};

exports.FILTERED_TRANSACTIONS = gql`
  query($allPairs: [String!]) {
    mints(
      first: 20
      where: { pool_in: $allPairs }
      orderBy: timestamp
      orderDirection: desc
    ) {
      transaction {
        id
        timestamp
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      to
      amount0
      amount1
      amountUSD
    }
    burns(first: 20, where: { pool_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      amount0
      amount1
      amountUSD
    }
    trades(first: 30, where: { pool_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
      id
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
  }
`;

exports.SWAP_TRANSACTIONS = gql`
  query ($allPairs: [String!], $lastTime: BigInt) {
    trades(
      first: 1000
      where: { pool_in: $allPairs, timestamp_gte: $lastTime }
      orderBy: timestamp
      orderDirection: desc
    ) {
      transaction {
        id
        timestamp
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
  }
`;


exports.TRENDING_TOKENS = gql`
  query trendingTokens($skip: Int!, $first: Int!) {
    tokenDayDatas(orderBy: dailyVolumeUSD, orderDirection: desc, first: $first, skip: $skip) {
      dailyTxCount
      dailyVolumeUSD
      priceUSD
      token {
        name
        symbol
        decimals
        id
        tokenHourData(orderBy: hourStartUnix, orderDirection: desc, first: 2) {
          priceUSD
          hourStartUnix
        }
        tokenDayData(orderBy: date, orderDirection: desc, first: 2) {
          date
          priceUSD
        }
      }
    }
  }
`;

exports.TOP_TRADERS = gql`
  query topTraders($skip: Int!, $first: Int!, $totalVolumeUSD: BigDecimal!) {
    wallets(orderBy: totalVolumeUSD, orderDirection: desc, first: $first, skip: $skip, where: { totalVolumeUSD_gte: $totalVolumeUSD }) {
      totalVolumeUSD
      txCount
      id
      walletDayData {
        dailyTradedUSD
        dailyTxCount
        id
      }
      walletHourData {
        hourlyTradedUSD
        hourlyTradedQuote
        id
      }
    }
  }
`;

exports.NEW_PAIR_LISTING = gql`
  query newPairListing($skip: Int!, $first: Int!){
    pools(orderBy: createdAtTimestamp, orderDirection: desc, skip: $skip, first: $first) {
      createdAtTimestamp
      volumeUSD
      volumeToken1
      volumeToken0
      token0 {
        id
        name
        symbol
        priceUSD
      }
      token1 {
        id
        name
        symbol
        priceUSD
      }
      poolDayData {
        dailyVolumeUSD
        dailyVolumeToken1
        dailyVolumeToken0
        dailyTxCount
      }
      exchange {
        totalVolumeUSD
        txCount
      }
    }
  }
`