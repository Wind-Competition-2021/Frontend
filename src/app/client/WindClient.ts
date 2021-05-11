import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { BACKEND_BASE_URL, DEBUG_MODE } from "../App";
import { showErrorModal } from "../dialogs/Dialog";
import { APIError } from "./Exception";
import { Config, SingleStockCandleChart, StockList } from "./types";

const axiosRespHandler = (resp: AxiosResponse<any>) => {
    let data = resp.data as {
        ok: boolean;
        message: null | string;
        data?: any;
    };
    if (!data.ok) {
        console.log(data);
        showErrorModal(JSON.stringify(data.ok));
        throw new APIError(JSON.stringify(data.ok));
    }
    resp.data = data.data;
    return resp;
};

const axiosErrorHandler = (err: any) => {
    let resp = err.response;
    console.log(resp);
    if (resp) {
        const data = resp.data as {
            data?: any;
            message: string;
            success: boolean;
            error?: any;
        };
        if (DEBUG_MODE) {
            showErrorModal(JSON.stringify(data), resp.status + " " + resp.statusText);
        }
        else { showErrorModal(data.message, resp.status + " " + resp.statusText); }
    }
    else
        showErrorModal(String(err), "发生错误");
    throw err;
};
class WindClient {
    private token: string | null = null;
    private config: Config | null = null;
    private axiosObj = axios.create({
        baseURL: BACKEND_BASE_URL,
    });
    private vanillaClient = axios.create({
        baseURL: BACKEND_BASE_URL,
    });
    public getAxiosClient() {
        return this.axiosObj!;
    }
    public getVanillaClient() {
        return this.vanillaClient;
    }
    constructor() {
        this.axiosObj.interceptors.response.use(axiosRespHandler, axiosErrorHandler);
        this.vanillaClient.interceptors.response.use(r => r, axiosErrorHandler);

    }
    public async loadData() {
        const localToken = window.localStorage.getItem("token");
        const localConfig = JSON.stringify(window.localStorage.getItem("config"));
        if (!localToken || !localConfig) {
            this.token = await this.requestToken();
        } else {
            this.token = localToken;
        }
        this.axiosObj.interceptors.request.use(req => {
            req.headers = { ...req.headers, "x-auth-token": this.token };
            return req;
        });
        if (localConfig) {
            try {
                await this.setRemoteConfig(this.config!);
            } catch (err) {
                this.config = await this.requestDefaultConfig();
            }
        } else this.config = await this.requestDefaultConfig();

        window.localStorage.setItem("token", this.token);
        window.localStorage.setItem("config", JSON.stringify(this.config));

    }
    public async requestToken(): Promise<string> {
        return ((await this.vanillaClient.post("/api/token")).data as { token: string }).token;
    }
    public async requestDefaultConfig(): Promise<Config> {
        return (await this.vanillaClient.get("/api/default_config")).data as Config;
    }
    public async setRemoteConfig(config: Config) {
        return (await this.axiosObj.post("/api/config", config)).data as {};
    }
    public async doStockSearch(keyword: string) {
        return (await this.axiosObj.get("/api/search_stock", { params: { keyword: keyword } })).data as StockList;
    }
    public async getCandleData(stock_id: string) {
        return (await this.axiosObj.get("/api/candle_data", { params: { stock_id: stock_id } })).data as SingleStockCandleChart;
    }
}

const client = new WindClient();

export { WindClient, client };
