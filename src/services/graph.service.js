// const logger = require("@logger");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const { syncSwapClient, zkSwapClient, koiFinanceClient, txClient, blockClient } = require('../apollo/client');
const {
  ALL_PAIRS,
  PAIRS_CURRENT,
  PAIRS_BULK1,
  PAIRS_HISTORICAL_BULK,
  PAIR_DATA,
  ALL_TOKENS,
  FILTERED_TRANSACTIONS,
  SWAP_TRANSACTIONS,
  GET_BLOCKS,
  TRENDING_TOKENS,
  TOP_TRADERS,
  NEW_PAIR_LISTING,
} = require('../apollo/queries');
const { TxnType, sourceDexType } = require('../constants/enum');
const { getPercentChange, getTimestampsForChanges } = require('../utils/graph.utils');

const graphClients = [syncSwapClient, zkSwapClient, koiFinanceClient];

class GraphService {
  splitQuery = async (query, vars, list, skipCount = 100) => {
    let fetchedData = {};
    let allFound = false;
    let skip = 0;

    while (!allFound) {
      let end = list.length;
      if (skip + skipCount < list.length) {
        end = skip + skipCount;
      }
      const sliced = list.slice(skip, end);
      const result = await blockClient().query({
        query: query(...vars, sliced),
        fetchPolicy: 'network-only',
      });
      fetchedData = {
        ...fetchedData,
        ...result.data,
      };
      if (Object.keys(result.data).length < skipCount || skip + skipCount > list.length) {
        allFound = true;
      } else {
        skip += skipCount;
      }
    }

    return fetchedData;
  };

  getBlocksFromTimestamps = async (timestamps, skipCount = 500) => {
    if (timestamps?.length === 0) {
      return [];
    }

    const fetchedData = await this.splitQuery(GET_BLOCKS, [], timestamps, skipCount);

    const blocks = [];
    if (fetchedData) {
      for (const t in fetchedData) {
        if (fetchedData[t].length > 0) {
          blocks.push({
            timestamp: t.split('t')[1],
            number: fetchedData[t][0]['number'],
          });
        }
      }
    }
    return blocks;
  };

  getAllPair = async () => {
    let allFound = false;
    let pools = [];
    let skipCount = 0;
    try {
      while (!allFound) {
        const query = {
          query: ALL_PAIRS,
          variables: {
            skip: skipCount,
          },
          fetchPolicy: 'network-only',
        };
        const response = await Promise.all(graphClients.map((item) => item().query(query)));

        skipCount = skipCount + 10;
        const queryData = response
          .map((item) => item.data?.pools)
          .flat()
          .map((item, index) => {
            let dexType = sourceDexType.SYNC_SWAP;
            if (index >= 2 * 10) {
              dexType = sourceDexType.KOI_FINANCE;
            } else if (index >= 10) {
              dexType = sourceDexType.ZK_SWAP;
            }
            return { ...item, dexType };
          });
        pools = pools.concat(queryData);
        if (queryData.length < 30) {
          allFound = true;
        }
      }

      return pools;
    } catch (e) {
      // logger.warn("graphService got exception:" + e);
      return false;
    }
  };

  getTopPairs = async (count) => {
    try {
      // fetch all current and historical data
      const query = {
        query: PAIRS_CURRENT(count),
        fetchPolicy: 'network-only',
      };
      const response = await Promise.all(graphClients.map((item) => item().query(query)));
      return response
        .map((item) => item.data.pools)
        .flat()
        .map((item, index) => {
          let dexType = sourceDexType.SYNC_SWAP;
          if (index >= 2 * count) {
            dexType = sourceDexType.KOI_FINANCE;
          } else if (index >= count) {
            dexType = sourceDexType.ZK_SWAP;
          }
          return { ...item, dexType };
        });
    } catch (e) {
      console.log(e);
    }
  };

  getAllTokens = async () => {
    try {
      let allFound = false;
      let skipCount = 0;
      let tokens = [];
      while (!allFound) {
        const query = {
          query: ALL_TOKENS,
          variables: {
            skip: skipCount,
          },
          fetchPolicy: 'network-only',
        };
        const response = await Promise.all(graphClients.map((item) => item().query(query)));

        skipCount = skipCount + 10;
        const queryData = response
          .map((item) => item.data?.tokens)
          .flat()
          .map((item, index) => {
            let dexType = sourceDexType.SYNC_SWAP;
            if (index >= 2 * 10) {
              dexType = sourceDexType.KOI_FINANCE;
            } else if (index >= 10) {
              dexType = sourceDexType.ZK_SWAP;
            }
            return { ...item, dexType };
          });
        tokens = tokens.concat(queryData);
        if (queryData.length < 30) {
          allFound = true;
        }
      }
      return tokens;
    } catch (e) {
      console.log(e);
    }
  };

  getPairTransactions = async (dexType, poolAddress) => {
    try {
      const result = await txClient(dexType).query({
        query: FILTERED_TRANSACTIONS,
        variables: {
          allPairs: [poolAddress],
        },
        fetchPolicy: 'no-cache',
      });

      const mints = result.data.mints.map((item) => {
        return { ...item, type: TxnType.ADD };
      });
      const swaps = result.data.trades.map((item) => {
        const amount0 = item.amount0Out > 0 ? item.amount0Out : item.amount1Out;
        const amount1 = item.amount0In > 0 ? item.amount0In : item.amount1In;
        const token0 = item.amount0Out > 0 ? item.pool.token0 : item.pool.token1;
        const token1 = item.amount0Out > 0 ? item.pool.token1 : item.pool.token0;
        return {
          ...item,
          amount0,
          amount1,
          pool: { token0, token1 },
          type: item.amount0Out > 0 ? TxnType.SELL : TxnType.BUY,
        };
      });
      const burns = result.data.burns.map((item) => {
        return { ...item, type: TxnType.REMOVE };
      });
      return mints.concat(swaps).concat(burns);
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  getSwapTransactions = async (dexType, poolId, startTime) => {
    const oneDayAgo = dayjs.utc().subtract(1, 'day').unix();
    const sTimestamp = startTime > 0 ? startTime : oneDayAgo;
    try {
      const result = await txClient(dexType).query({
        query: SWAP_TRANSACTIONS,
        variables: {
          allPairs: [poolId],
          lastTime: sTimestamp,
        },
        fetchPolicy: 'network-only',
      });
      const swaps = result.data.trades;

      return swaps;
    } catch (e) {
      return;
    }
  };

  getBulkPairData = async (poolList) => {
    const [t30m, t1h, t6h, t12h, t24h, tWeek] = getTimestampsForChanges();
    const a = await this.getBlocksFromTimestamps([t30m, t1h, t6h, t12h, t24h, tWeek]);
    const [{ number: b30m }, { number: b1h }, { number: b6h }, { number: b12h }, { number: b24h }, { number: bWeek }] =
      a;
    try {
      const current = await syncSwapClient().query({
        query: PAIRS_BULK1,
        variables: {
          allPairs: poolList,
        },
        fetchPolicy: 'network-only',
      });

      const [halfHourResult, oneHourResult, sixHourResult, twelveHourResult, oneDayResult, oneWeekResult] =
        await Promise.all(
          [b30m, b1h, b6h, b12h, b24h, bWeek].map(async (block) => {
            const result = await syncSwapClient().query({
              query: PAIRS_HISTORICAL_BULK(block, poolList),
              fetchPolicy: 'network-only',
            });
            return result;
          })
        );

      const halfHourData = halfHourResult?.data?.pools.reduce((obj, cur) => {
        return { ...obj, [cur.id]: cur };
      }, {});

      const oneHourData = oneHourResult?.data?.pools.reduce((obj, cur) => {
        return { ...obj, [cur.id]: cur };
      }, {});

      const sixHourData = sixHourResult?.data?.pools.reduce((obj, cur) => {
        return { ...obj, [cur.id]: cur };
      }, {});

      const twelveHourData = twelveHourResult?.data?.pools.reduce((obj, cur) => {
        return { ...obj, [cur.id]: cur };
      }, {});

      const oneDayData = oneDayResult?.data?.pools.reduce((obj, cur) => {
        return { ...obj, [cur.id]: cur };
      }, {});

      const oneWeekData = oneWeekResult?.data?.pools.reduce((obj, cur) => {
        return { ...obj, [cur.id]: cur };
      }, {});

      const poolData = await Promise.all(
        current &&
          current.data.pools.map(async (pool) => {
            let data = pool;
            let halfHourHistory = halfHourData?.[pool.id];
            if (!halfHourHistory) {
              const newData = await syncSwapClient().query({
                query: PAIR_DATA(pool.id, b30m),
                fetchPolicy: 'network-only',
              });
              halfHourHistory = newData.data.pools[0];
            }
            let oneHourHistory = oneHourData?.[pool.id];
            if (!oneHourHistory) {
              const newData = await syncSwapClient().query({
                query: PAIR_DATA(pool.id, b1h),
                fetchPolicy: 'network-only',
              });
              oneHourHistory = newData.data.pools[0];
            }
            let sixHourHistory = sixHourData?.[pool.id];
            if (!sixHourHistory) {
              const newData = await syncSwapClient().query({
                query: PAIR_DATA(pool.id, b6h),
                fetchPolicy: 'network-only',
              });
              sixHourHistory = newData.data.pools[0];
            }
            let twelveHourHistory = twelveHourData?.[pool.id];
            if (!twelveHourHistory) {
              const newData = await syncSwapClient().query({
                query: PAIR_DATA(pool.id, b12h),
                fetchPolicy: 'network-only',
              });
              twelveHourHistory = newData.data.pools[0];
            }
            let oneDayHistory = oneDayData?.[pool.id];
            if (!oneDayHistory) {
              const newData = await syncSwapClient().query({
                query: PAIR_DATA(pool.id, b24h),
                fetchPolicy: 'network-only',
              });
              oneDayHistory = newData.data.pools[0];
            }
            let oneWeekHistory = oneWeekData?.[pool.id];
            if (!oneWeekHistory) {
              const newData = await syncSwapClient().query({
                query: PAIR_DATA(pool.id, bWeek),
                fetchPolicy: 'network-only',
              });
              oneWeekHistory = newData.data.pools[0];
            }

            // this is because old history data returns exact same data as current data when the old data does not exist
            if (
              Number(halfHourHistory?.reserveUSD ?? 0) === Number(data?.reserveUSD ?? 0) &&
              Number(halfHourHistory?.volumeUSD ?? 0) === Number(data?.volumeUSD ?? 0)
            ) {
              halfHourHistory = null;
            }

            if (
              Number(oneHourHistory?.reserveUSD ?? 0) === Number(data?.reserveUSD ?? 0) &&
              Number(oneHourHistory?.volumeUSD ?? 0) === Number(data?.volumeUSD ?? 0)
            ) {
              oneHourHistory = null;
            }

            if (
              Number(sixHourHistory?.reserveUSD ?? 0) === Number(data?.reserveUSD ?? 0) &&
              Number(sixHourHistory?.volumeUSD ?? 0) === Number(data?.volumeUSD ?? 0)
            ) {
              sixHourHistory = null;
            }

            if (
              Number(twelveHourHistory?.reserveUSD ?? 0) === Number(data?.reserveUSD ?? 0) &&
              Number(twelveHourHistory?.volumeUSD ?? 0) === Number(data?.volumeUSD ?? 0)
            ) {
              twelveHourHistory = null;
            }

            if (
              Number(oneDayHistory?.reserveUSD ?? 0) === Number(data?.reserveUSD ?? 0) &&
              Number(oneDayHistory?.volumeUSD ?? 0) === Number(data?.volumeUSD ?? 0)
            ) {
              oneDayHistory = null;
            }

            if (
              Number(oneWeekHistory?.reserveUSD ?? 0) === Number(data?.reserveUSD ?? 0) &&
              Number(oneWeekHistory?.volumeUSD ?? 0) === Number(data?.volumeUSD ?? 0)
            ) {
              oneWeekHistory = null;
            }

            data = parseData(
              data,
              halfHourHistory,
              oneHourHistory,
              sixHourHistory,
              twelveHourHistory,
              oneDayHistory,
              oneWeekHistory
            );
            return data;
          })
      );
      return poolData;
    } catch (e) {
      console.log('getBulkPairData', e);
    }
  };

  getTrendingTokens = async (skip, first) => {
    try {
      const query = {
        query: TRENDING_TOKENS,
        variables: {
          skip,
          first,
        },
        fetchPolicy: 'network-only',
      };
      const response = await Promise.all(graphClients.map((item) => item().query(query)));
      return response
        .map((item) => item.data.tokenDayDatas)
        .flat()
        .map((item, index) => {
          let dexType = sourceDexType.SYNC_SWAP;
          if (index >= 2 * first) {
            dexType = sourceDexType.KOI_FINANCE;
          } else if (index >= first) {
            dexType = sourceDexType.ZK_SWAP;
          }
          return { ...item, dexType };
        });
    } catch (e) {
      throw e;
    }
  };

  getTopTraders = async (skip, first, totalVolumeUSD) => {
    try {
      const query = {
        query: TOP_TRADERS,
        variables: {
          skip,
          first,
          totalVolumeUSD,
        },
        fetchPolicy: 'network-only',
      };
      const response = await Promise.all(graphClients.map((item) => item().query(query)));
      return response
        .map((item) => item.data.wallets)
        .flat()
        .map((item, index) => {
          let dexType = sourceDexType.SYNC_SWAP;
          if (index >= 2 * first) {
            dexType = sourceDexType.KOI_FINANCE;
          } else if (index >= first) {
            dexType = sourceDexType.ZK_SWAP;
          }
          return { ...item, dexType };
        });
    } catch (e) {
      throw e;
    }
  };

  getNewPairListing = async (skip, first) => {
    try {
      const query = {
        query: NEW_PAIR_LISTING,
        variables: {
          skip,
          first,
        },
        fetchPolicy: 'network-only',
      };
      const response = await Promise.all(graphClients.map((item) => item().query(query)));
      return response
        .map((item) => item.data.pools)
        .flat()
        .map((item, index) => {
          let dexType = sourceDexType.SYNC_SWAP;
          if (index >= 2 * first) {
            dexType = sourceDexType.KOI_FINANCE;
          } else if (index >= first) {
            dexType = sourceDexType.ZK_SWAP;
          }
          return { ...item, dexType };
        });
    } catch (e) {
      console.log(e);
    }
  };

  parseData = (data, halfHourData, oneHourData, sixHourData, twelveHourData, oneDayData, oneWeekData) => {
    // get volume changes
    const [halfHourVolumeUSD, halfHourVolumeChangeUSD] = getPercentChange(
      data?.volumeUSD ? data.volumeUSD : 0,
      halfHourData?.volumeUSD ? halfHourData.volumeUSD : 0
    );

    const [oneHourVolumeUSD, oneHourVolumeChangeUSD] = getPercentChange(
      data?.volumeUSD ? data.volumeUSD : 0,
      oneHourData?.volumeUSD ? oneHourData.volumeUSD : 0
    );

    const [sixHourVolumeUSD, sixHourVolumeChangeUSD] = getPercentChange(
      data?.volumeUSD ? data.volumeUSD : 0,
      sixHourData?.volumeUSD ? sixHourData.volumeUSD : 0
    );

    const [twelveHourVolumeUSD, twelveHourVolumeChangeUSD] = getPercentChange(
      data?.volumeUSD ? data.volumeUSD : 0,
      twelveHourData?.volumeUSD ? twelveHourData.volumeUSD : 0
    );

    const [oneDayVolumeUSD, volumeChangeUSD] = getPercentChange(
      data?.volumeUSD ? data.volumeUSD : 0,
      oneDayData?.volumeUSD ? oneDayData.volumeUSD : 0
    );

    const oneWeekVolumeUSD = Number(oneWeekData ? data?.volumeUSD - oneWeekData?.volumeUSD : data.volumeUSD);

    // set volume properties
    data.halfHourVolumeUSD = halfHourVolumeUSD;
    data.oneHourVolumeUSD = oneHourVolumeUSD;
    data.sixHourVolumeUSD = sixHourVolumeUSD;
    data.twelveHourVolumeUSD = twelveHourVolumeUSD;
    data.oneDayVolumeUSD = oneDayVolumeUSD;
    data.oneWeekVolumeUSD = oneWeekVolumeUSD;
    data.volumeChangeUSD = volumeChangeUSD;

    data.halfHourVolumeChangeUSD = halfHourVolumeChangeUSD;
    data.sixHourVolumeChangeUSD = sixHourVolumeChangeUSD;
    data.twelveHourVolumeChangeUSD = twelveHourVolumeChangeUSD;
    data.oneHourVolumeChangeUSD = oneHourVolumeChangeUSD;

    // set liquidity properties
    data.liquidityChangeUSD = getPercentChange(data.reserveUSD, oneDayData?.reserveUSD);

    if (!oneDayData && data) {
      data.oneDayVolumeUSD = Number(data.volumeUSD);
    }
    if (!oneWeekData && data) {
      data.oneWeekVolumeUSD = Number(data.volumeUSD);
    }

    return data;
  };
}

module.exports = new GraphService();
