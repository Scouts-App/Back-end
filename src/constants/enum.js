module.exports.TxnType = {
  BUY: 0,
  SELL: 1,
  ADD: 2,
  REMOVE: 3,
};

module.exports.alertTokenType = {
  PRICE_RISES_ABOVE: 0,
};

module.exports.alertTokenTriggerType = {
  ONLY_ONCE: 'ONLY_ONCE',
  ALWAYS: 'ALWAYS',
};

module.exports.sourceDexType = {
  SYNC_SWAP: 'SYNC_SWAP',
  ZK_SWAP: 'ZK_SWAP',
  KOI_FINANCE: 'KOI_FINANCE',
};
