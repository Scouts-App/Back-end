const dayjs = require("dayjs");

exports.getTimestampsForChanges = () => {
    const utcCurrentTime = dayjs();
    const t30m = utcCurrentTime
        .subtract(30, 'minute')
        .startOf('minute')
        .unix();
    const t1h = utcCurrentTime
        .subtract(1, 'hour')
        .startOf('minute')
        .unix();
    const t6h = utcCurrentTime
        .subtract(6, 'hour')
        .startOf('minute')
        .unix();
    const t12h = utcCurrentTime
        .subtract(12, 'hour')
        .startOf('minute')
        .unix();
    const t24h = utcCurrentTime
        .subtract(1, 'day')
        .startOf('minute')
        .unix();
    const tWeek = utcCurrentTime
        .subtract(1, 'week')
        .startOf('minute')
        .unix();
    return [t30m, t1h, t6h, t12h, t24h, tWeek];
};

exports.getPercentChange = (valueNow, value24HoursAgo) => {
    const adjustedPercentChange =
        ((valueNow - value24HoursAgo) / value24HoursAgo) * 100;
    if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
        return 0;
    }
    return adjustedPercentChange;
};