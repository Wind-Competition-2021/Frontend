interface StockListItem {
    stockID: string;//股票ID
    name: string;//股票名
    match: string;//当前价格
    range: string;//涨跌幅度
    high: string;//最高价
    low: string;//最低价
    volume: string;//成交量
    turnover: string;//成交额
};
type StockList = StockListItem[];

interface Config {
    pinnedStocks: string[];//用户置顶股票列表
    stockListRefreshInterval: number;//股票列表刷新间隔
    singleStockRefreshInterval: number;//单只股票数据刷新间隔
};
interface SingleStockTrend {
    tradetime: number;//从9:00开始的分钟数
    price: string;//成交均价
    tradecount: string;//成交量
};
interface SingleStockCandleChartItem {
    date: string;//日期
    open: string;//开盘价
    close: string;//收盘价
    low: string;//最低价
    high: string;//最高价
    volume: string;//成交量
    average5: string;//五日均价
};
type SingleStockCandleChart = SingleStockCandleChartItem[];

export type {
    Config,
    SingleStockTrend,
    SingleStockCandleChart,
    SingleStockCandleChartItem,
    StockList,
    StockListItem
};