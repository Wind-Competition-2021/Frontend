import axios from "axios";
import { BACKEND_BASE_URL, DEBUG_MODE } from "../App";
import { showErrorModal } from "../dialogs/Dialog";
import { Config, RealTimeDataByDay, RealTimeDataByMinute, RealTimeDataByWeek, RehabilitationType, StockBasicInfo, StockBasicInfoList, StockInfo, StockList, StockListFetchType, StockTrendList } from "./types";
import { v4 as uuidv4 } from "uuid";
import { CashFlow, DateIntervalDataBundle, Forcast, GrowthAbility, OperationalCapability, Profitability, QuarterDataBundle, Report, Solvency } from "./statement-types";
import { makeStockStateUpdateAction, store } from "../state/Manager";
// import _ from "lodash";
const axiosErrorHandler = (err: any) => {
    let resp = err.response;
    console.log(resp);
    if (resp) {
        const data = resp.data;
        if (DEBUG_MODE) {
            showErrorModal(JSON.stringify(data), resp.status + " " + resp.statusText);
        }
        else { showErrorModal(data.message, resp.status + " " + resp.statusText); }
    }
    else
        showErrorModal(String(err), "Error!");
    throw err;
};
type DataUpdateHandler<T> = (data: T) => void;
type StockListUpdateHandler = DataUpdateHandler<StockList>;
type SingleStockTrendUpdateHandler = DataUpdateHandler<StockTrendList>;


class WindClient {

    private token: string | null = null;
    private config: Config | null = null;
    private stockListUpdateHandlers = new Map<string, StockListUpdateHandler>();
    private singleStockTrendUpdateHandlers = new Map<string, SingleStockTrendUpdateHandler>();
    private stockByID = new Map<String, StockBasicInfo>();
    private fullStockList: StockBasicInfoList | null = null;
    private simpleStockList: StockBasicInfoList | null = null;

    private stockListSocket: WebSocket | null = null;
    private singleStockSocket: WebSocket | null = null;

    private wrappedClient = axios.create();
    private vanillaClient = axios.create();
    /**
     * Get the wrapped axios client
     * @returns return the axios client with a default x-auth-token and baseURL
     */
    public getWrappedClient() {
        return this.wrappedClient!;
    }
    /**
     * Get the vanilla axios client.
     * @returns return the axios client with baseURL
     */
    public getVanillaClient() {
        return this.vanillaClient;
    }
    constructor() {
        this.wrappedClient.interceptors.response.use(r => r, axiosErrorHandler);
        this.vanillaClient.interceptors.response.use(r => r, axiosErrorHandler);

    }
    public getStockBasicInfoByID(id: string): StockBasicInfo | undefined {
        return this.stockByID.get(id);
    }
    /**
     * Get the config object stored in the memory
     * @returns the config object
     */
    public getLocalConfig() {
        return this.config
    }
    public getLocalFullStockBasicInfoList() {
        return this.fullStockList!;
    }
    public getLocalSimpleStockBasicInfoList() {
        return this.simpleStockList!;
    }
    /**
     * Set the config object stored in memory and localStorage
     * @param config the config object
     */
    public setLocalConfig(config: Config): void {
        this.config = config;
        window.localStorage.setItem("config", JSON.stringify(config));

    }
    /**
     * Add a listener to handle the change on general stock list
     * @param handler A function, called when changes on the stock list happened.
     * @returns A token, which could be used to remove this listener
     */
    public addStockListUpdateListener(handler: StockListUpdateHandler): string {
        const id = uuidv4();
        this.stockListUpdateHandlers.set(id, handler);
        return id;
    };
    /**
     * Remove a listener to the stock list update
     * @param id A token returned in `addStockListUpdateListener`
     */
    public removeStockListUpdateListener(id: string) {
        if (this.stockListUpdateHandlers.has(id)) this.stockListUpdateHandlers.delete(id);
    }
    /**
     * Add a listener to handle the change on single stock trend
     * @param handler A function, called when changes on the single stock trend happened.
     * @returns A token, which could be used to remove this listener
     */
    public addSingleStockTrendUpdateListener(handler: SingleStockTrendUpdateHandler): string {
        const id = uuidv4();
        this.singleStockTrendUpdateHandlers.set(id, handler);
        return id;
    };
    /**
     * Remove a listener to the single stock trend update
     * @param id A token returned in `singleStockTrendUpdateListener`
     */
    public removeSingleStockTrendUpdateListener(id: string) {
        if (this.singleStockTrendUpdateHandlers.has(id)) this.singleStockTrendUpdateHandlers.delete(id);
    }
    /**
     * Load configuration from the browser's localStorage, and get some basic stuff from the server.
     * It will also obtain new configuration if that in the browser is invalid.
     * 
     */
    public async loadData() {
        this.vanillaClient.defaults.baseURL = BACKEND_BASE_URL;
        this.wrappedClient.defaults.baseURL = BACKEND_BASE_URL;

        // const localToken = window.localStorage.getItem("token");
        const localConfig: Config | null = JSON.parse(window.localStorage.getItem("config") || "null");
        // if (!localToken || !await this.validateToken(localToken)) {
        //     this.token = await this.requestNewToken();
        // } else {
        //     this.token = localToken;
        // }
        this.token = await this.requestNewToken();
        this.wrappedClient.interceptors.request.use(req => {
            req.headers = { ...req.headers, "Token": this.token };
            return req;
        });
        // console.log("local config=", localConfig);
        if (localConfig) {
            try {
                await this.updateRemoteConfig(localConfig);
                this.config = localConfig;
            } catch (err) {
                this.config = await this.requestDefaultConfig();
            }
        } else this.config = await this.requestDefaultConfig();
        // await this.updateRemoteConfig(this.config!);
        // window.localStorage.setItem("token", this.token);
        window.localStorage.setItem("config", JSON.stringify(this.config));
        this.simpleStockList = await this.getStockList("default");
        this.fullStockList = await this.getStockList("all");
        this.fullStockList.forEach(x => this.stockByID.set(x.id, x));
        store.dispatch(makeStockStateUpdateAction({ tradingTime: await this.getTradeStatus() }));
    }
    /**
     * Search stocks in the basic info list
     * @param keyword keyword
     * @param countLimit result count limit, default to 10
     * @returns stocks that match the keyword
     */
    public searchStock(keyword: string, countLimit: number = 10): StockBasicInfoList {
        keyword = keyword.trim();
        const result: StockBasicInfoList = [];
        for (let i = 0, j = 0; i < countLimit && j < this.fullStockList!.length; j++) {
            const current = this.fullStockList![j];
            if (current.id.includes(keyword) || current.name.includes(keyword)) {
                i++;
                result.push(current);
            }
        }
        return result;
    }
    /**
     * Connect to the stock list update socket.
     * This function will disconnect previous stock list update socket.
     */
    public connectStockListSocket() {
        if (this.stockListSocket) {
            this.stockListSocket.close();
        }
        this.stockListSocket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/api/quote/realtime/list?token=${this.token!}`);
        this.stockListSocket.onopen = () => {
            this.stockListSocket!.send(JSON.stringify(this.simpleStockList!.map(item => item.id)));
        };
        this.stockListSocket.onmessage = (msg: MessageEvent<string>) => {
            this.stockListUpdateHandlers.forEach(f => f(JSON.parse(msg.data) as StockList));
            // const data = JSON.parse(msg.data) as WebsocketPacketWrapper<StockList>;

            // if (!data.ok) {
            //     console.log("Failed to receive stock list update:", data.message);
            // } else { this.stockListUpdateHandlers.forEach(f => f(data.data)); }
        };
        this.stockListSocket.onclose = ev => {
            if (ev.code === 1000 && ev.reason === "Trade Off") {
                showErrorModal("股票列表已经停止刷新，这个可能是因为当前超过了交易时间。");
                store.dispatch(makeStockStateUpdateAction({ tradingTime: false }));
            } else if (ev.code !== 1000) {
                showErrorModal(`WebSocket连接已断开: ${ev.code} - ${ev.reason}`)
            }
        };
    }
    /**
     * Connect to the single stock update socket.
     * This function will disconnect previous stock list update socket.
     */
    public connectSingleStockSocket(stock_id: string) {
        if (this.singleStockSocket) {
            this.singleStockSocket.close();
        }

        this.singleStockSocket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/api/quote/realtime/trend?token=${this.token!}&id=${stock_id}`);
        console.log(this.singleStockSocket);
        console.log("Single socket to", stock_id, "created");
        this.singleStockSocket.onmessage = (msg: MessageEvent<string>) => {
            this.singleStockTrendUpdateHandlers.forEach(f => f(JSON.parse(msg.data) as StockTrendList));
            // const data = JSON.parse(msg.data) as WebsocketPacketWrapper<StockTrendList>;
            // if (!data.ok) {
            //     console.log("Failed to receive single stock update:", data.message);
            // } else { this.singleStockTrendUpdateHandlers.forEach(f => f(data.data)); }
        };
    }
    /**
     * Disconnect the single stock socket
     */
    public disconnectSingleStockSocket() {
        if (this.singleStockSocket) this.singleStockSocket.close();
    }
    /**
     * Disconnect the stock list socket
     */
    public disconnectStockListSocket() {
        if (this.stockListSocket) this.stockListSocket.close();
    }
    /**
     * Update config (both remote and local)
     * @param config config to update
     */
    public async updateConfig(config: Config) {
        await this.updateRemoteConfig(config);
        this.setLocalConfig(config);

    }
    /**
     * Request a new token from the server (which could be used to identify a user)
     * @returns A token, should be stored in localStorage.
     */
    public async requestNewToken(): Promise<string> {
        return ((await this.vanillaClient.get("/api/token")).data as string);
    }
    /**
     * Validate if a token is correct
     * @param token A token to be validated
     * @returns true if the token is valid, otherwise false
     */
    public async validateToken(token: string): Promise<boolean> {
        return (await this.vanillaClient.get("/api/token/validation", { params: { token: token } })).data as boolean;
    }
    /**
     * Obtain a copy of the default configuration from the server.
     * @returns The default config
     */
    public async requestDefaultConfig(): Promise<Config> {
        return (await this.vanillaClient.get("/api/config")).data as Config;
    }
    /**
     * Get the configuration stored in the server
     * @param token Which user's configuration you want 
     * @returns The config stored in the server
     */
    public async getRemoteConfig(token: string): Promise<Config> {
        return (await this.vanillaClient.get("/api/config", { params: { tokenId: token } })).data as Config;
    }
    /**
     * Store the config into the server
     * This function requires a valid token.
     * @param config config to store
     * @returns Nothing
     */
    public async updateRemoteConfig(config: Config) {
        // console.log("update config", config);
        return (await this.wrappedClient.put("/api/config", config)).data as {};
    }
    /**
     * Get the basic info of all the stocks.
     * Such basic info are usually used to execute a stock search.
     * @returns The basic info
     */
    public async getStockList(type: StockListFetchType): Promise<StockBasicInfoList> {
        return (await this.vanillaClient.get("/api/stock/list", { params: { type: type } })).data as StockBasicInfoList;
    }
    // /**
    //  * Get the price summary of a certain stock.
    //  * @param stockId 
    //  * @param startDate start date of the requested price summary, in format of yyyy-MM-DD, defaults to 30days ago
    //  * @param endDate end date of the requested price summary, in format of yyyy-MM-DD, defaults to day
    //  * @returns the price summary
    //  */
    // public async getPriceSummaryList(stockId: string, startDate: string | undefined, endDate: string | undefined) {
    //     return (await this.wrappedClient.get("/api/stock/price_summary", { params: { id: stockId, startDate: startDate, endDate: endDate } })).data as RealTimeDataByDay[];
    // }
    /**
     * Get the detail of a stock
     * @param id stock id
     * @returns the detailed info
     */
    public async getStockDetailedInfo(id: string): Promise<StockInfo> {
        return (await this.vanillaClient.get("/api/stock/info", { params: { id: id } })).data as StockInfo;
    }
    /**
     * Get real time data by minute 
     * @param id Stock id
     * @param beginDate begin date
     * @param endDate end date
     * @param frequency frequency by minute, 5, 15, 30 or 60, default to 60
     * @param rehabilitation `pre`, `post` or `none`
     * @returns 
     */
    public async getStockMinuteHistory(
        id: string,
        beginDate?: string,
        endDate?: string,
        frequency?: string,
        rehabilitation?: RehabilitationType
    ) {
        return (await this.vanillaClient.get("/api/quote/history/minute", {
            params: {
                id: id,
                "begin": beginDate,
                "end": endDate,
                frequency: frequency,
                rehabilitation: rehabilitation
            }
        })).data as RealTimeDataByMinute[];
    };
    /**
     * Get real time data by day
     * @param id stock id
     * @param beginDate begin date
     * @param endDate end date
     * @param rehabilitation `pre`, `post` or `none`
     * @returns 
     */
    public async getStockDayHistory(
        id: string,
        beginDate?: string,
        endDate?: string,
        rehabilitation?: RehabilitationType
    ) {
        return (await this.vanillaClient.get("/api/quote/history/day", {
            params: {
                id: id,
                "begin": beginDate,
                "end": endDate,
                rehabilitation: rehabilitation
            }
        })).data as RealTimeDataByDay[];
    }
    public async getStockWeekHistory(
        id: string,
        beginDate?: string,
        endDate?: string,
        frequency?: "week" | "month",
        rehabilitation?: RehabilitationType
    ) {
        return (await this.vanillaClient.get("/api/quote/history/week", {
            params: {
                id: id,
                "begin": beginDate,
                "end": endDate,
                frequency: frequency,
                rehabilitation: rehabilitation
            }
        })).data as RealTimeDataByWeek[];
    }
    /**
     * Get finicial statement of a certain stock in a certain quarter
     * @param id stock id
     * @param year year
     * @param quarter quarter, `1`, `2`, `3` or `4`
     * @returns The data
     */
    public async getQuarterStockStatement(id: string, year?: number, quarter?: 1 | 2 | 3 | 4): Promise<QuarterDataBundle> {
        const wrapURL = (s: string) => `/api/statement/${s}`;
        let resp = (await axios.all([
            "profitability", "operational-capability", "growth-ability", "solvency", "cash-flow"
        ].map(item => this.vanillaClient.get(wrapURL(item), { params: { id: id, year: year, quarter: quarter } })))).map(i => i.data);
        return {
            profitability: resp[0] as Profitability,
            operationalCapability: resp[1] as OperationalCapability,
            growthAbility: resp[2] as GrowthAbility,
            solvency: resp[3] as Solvency,
            cashFlow: resp[4] as CashFlow,
            // dupond: resp[5] as Dupond
        };
    }
    /**
     * Get finicial statement of a certain stock in a certain date range
     * @param id Stock id
     * @param beginDate begin date, in format of `yyyy-mm-dd`, default to today
     * @param endDate end date, in format of `yyyy-mm-dd`
     * @returns 
     */
    public async getDateIntervalStockStatement(id: string, beginDate?: string, endDate?: string): Promise<DateIntervalDataBundle> {
        const wrapURL = (s: string) => `/api/statement/${s}`;
        let resp = (await axios.all([
            "report", "forcast"
        ].map(item => this.vanillaClient.get(wrapURL(item), { params: { id: id, "begin": beginDate, "end": endDate } })))).map(i => i.data);
        return {
            report: resp[0] as Report,
            forcast: resp[1] as Forcast
        };
    }
    public async getTradeStatus(date?: string): Promise<boolean> {
        return (await this.vanillaClient.get("/api/quote/trade-status", { params: { date: date } })).data as boolean;
    }

}

const client = new WindClient();
(window as (typeof window) & { windClient: WindClient }).windClient = client;
export { WindClient, client };
export type { StockListUpdateHandler };
