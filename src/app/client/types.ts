// interface StockListItem {
//     stockID: string;//股票ID
//     name: string;//股票名
//     match: string;//当前价格
//     range: string;//涨跌幅度
//     high: string;//最高价
//     low: string;//最低价
//     volume: string;//成交量
//     turnover: string;//成交额
//     pinned: boolean;//是否置顶
// };
// type StockList = StockListItem[];
type RehabilitationType = "pre" | "post" | "none";
interface Config {
    pinnedStocks: string[];//用户置顶股票列表
    refreshInterval: {
        single: number;//单只股票数据刷新间隔
        list: number;//股票列表刷新间隔
    }
};
/**
 * Used to draw a trend line (data from websocket)
 */
interface StockTrendItem {
    id: string;//股票ID
    preClosing: number;//前一分钟收盘价
    opening: number;//这分钟的开盘价
    closing: number;//现价
    highest: number;//最高价
    lowest: number;//最低价
    volume: number;//成交量
    turnover: number;//成交额
    time: string;//时间，形如2021-05-17T17:53:01.464Z
};
type StockTrendList = StockTrendItem[];
// /**
//  * K线数据
//  */
// interface PriceSummaryItem {
//     date: string;//日期
//     open: string;//开盘价
//     close: string;//收盘价
//     low: string;//最低价
//     high: string;//最高价
//     volume: string;//成交量
//     average5: string;//五日均价
// };
// type PriceSummaryList = PriceSummaryItem[];
/**
 *  股票基本信息
 */
interface StockBasicInfo {
    id: string;
    name: string;
};
type StockBasicInfoList = StockBasicInfo[];
/**
 * 股票详细信息
 */
interface StockInfo extends StockBasicInfo {
    type: "stock" | "index";
    industry: string;
    classification: string;
    listedDate: string;
    delistedDate: string;
};
interface WebsocketPacketWrapper<T> {
    ok: boolean;
    message: string | null | undefined;
    data: T;
};

interface BasicRealTimeData {
    id: string;
    preClosing: number;
    opening: number;
    closing: number;
    highest: number;
    lowest: number;
    volume: number;
    turnover: number;
};

/**
 * 分钟级数据
 */
interface RealTimeDataByMinute extends BasicRealTimeData {
    time: string;
    rehabilitation: RehabilitationType;//复权类型

};
/**
 * 日级数据
 * 同时也用于绘制K线
 */
interface RealTimeDataByDay extends BasicRealTimeData {
    date: string;//2021-05-17
    rehabilitation: RehabilitationType;
    turnoverRate: number;//换手率
    per: number;//市盈率
    psr: number;//市销率
    pcfr: number;//市现率
    pbr: number;//市净率
    stopped: boolean;//是否停市
    specialTreatment: boolean;//是否为ST
};
/**
 * 周月级数据
 */
interface RealTimeDataByWeek extends BasicRealTimeData {
    date: string;
    rehabilitation: "pre" | "post" | "none";
    turnoverRate: number;//换手率
};
/**
 * 股票列表数据
 */
interface StockListItem extends RealTimeDataByMinute {
    pinned: boolean;
};
type StockList = StockListItem[];


export type {
    Config,
    StockTrendItem,
    StockTrendList,
    // PriceSummaryList,
    // PriceSummaryItem,
    StockList,
    StockListItem,
    StockBasicInfo,
    StockBasicInfoList,
    WebsocketPacketWrapper,
    RealTimeDataByDay,
    RealTimeDataByMinute,
    RealTimeDataByWeek,
    BasicRealTimeData,
    StockInfo,
    RehabilitationType
};