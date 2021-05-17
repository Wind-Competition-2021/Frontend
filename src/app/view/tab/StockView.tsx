import React, { useEffect, useState } from "react";
import { Dimmer, Loader } from "semantic-ui-react";
import { convertNumbers, useDocumentTitle } from "../../common/Util";
import Chart from "react-google-charts";
import { Container } from "semantic-ui-react";
import { client } from "../../client/WindClient";
import { StockList } from "../../client/types";
import { Layout } from "./StockViewLayout";
import "./StockView.css"
import { GoogleChartWrapper } from "react-google-charts/dist/types";
const StockView: React.FC<{}> = () => {
    // const [darkMode, setDarkMode] = useDarkMode();
    useDocumentTitle("主页");
    const [loaded, setLoaded] = useState(false);
    const [stockList, setStockList] = useState<StockList | null>(null);
    const [currentStock, setCurrentStock] = useState<string | null>(null);
    const [stockListChartWrapper, setStockListChartWrapper] = useState<GoogleChartWrapper | null>(null);
    useEffect(() => {
        if (loaded) {
            const token = client.addStockListUpdateListener((val) => {
                setStockList(val);
            });
            return () => client.removeStockListUpdateListener(token);
        }
    }, [loaded]);
    useEffect(() => {
        if (!loaded) {
            setLoaded(true);
        }
    }, [loaded]);
    useEffect(() => {
        // console.log("recv", "current stock", currentStock);
        if (stockListChartWrapper && stockList) {
            const chart = stockListChartWrapper.getChart();
            let id = -1;
            for (let i = 0; i < stockList!.length; i++) {
                if (stockList![i].stockID === currentStock) {
                    id = i; break;
                }
            }
            if (id !== -1)
                (chart as (typeof chart) & ({ setSelection: (arg0: any) => void }))
                    .setSelection([{ row: id }]);
        }
        // eslint-disable-next-line
    }, [stockList, stockListChartWrapper]);
    useEffect(() => {
        if (currentStock != null) {
            client.connectSingleStockSocket(currentStock);
            const token = client.addSingleStockTrendUpdateListener(val => {
                console.log("single update", val);
            });
            return () => {
                client.removeSingleStockTrendUpdateListener(token);
                client.disconnectSingleStockSocket();
            };
        }
    }, [currentStock]);
    const wrapNumber = (num: string, multi10000 = false) => {
        return ({ v: multi10000 ? parseFloat(num) / 10000 : parseInt(num), f: convertNumbers(num, multi10000) });
    }
    const stockListChart = <Chart

        getChartWrapper={x => setStockListChartWrapper(x)}
        width={"100%"}
        height={"300px"}
        chartType="Table"
        loader={<Dimmer active><Loader>股票数据加载中</Loader></Dimmer>}
        options={{ showRowNumber: true }}
        data={[
            [{ type: "string", label: "股票代码" },
            { type: "string", label: "股票名" },
            { type: "number", label: "当前价格" },
            { type: "number", label: "涨跌幅度" },
            { type: "number", label: "最高价" },
            { type: "number", label: "最低价" },
            { type: "number", label: "成交量" },
            { type: "number", label: "成交额" },
            { type: "boolean", label: "是否置顶" }
            ],
            ...(stockList || []).map(item => [
                item.stockID,
                item.name,
                wrapNumber(item.match, true),
                wrapNumber(item.range, true),
                wrapNumber(item.high, true),
                wrapNumber(item.low, true),
                wrapNumber(item.volume),
                wrapNumber(item.turnover),
                item.pinned
            ])]}
        formatters={[
            {
                type: "ArrowFormat",
                column: 3,
            }
        ]}
        chartEvents={[
            {
                eventName: "select", callback: ({ chartWrapper }) => {
                    const chart = chartWrapper.getChart();
                    console.log(chart.getSelection());
                    if (chart.getSelection()[0])
                        setCurrentStock(stockList![chart.getSelection()[0].row!].stockID);
                }
            }
        ]}
    ></Chart>;
    return <Container>
        <Layout
            name="default"
            candleChart={<div></div>}
            singleTrend={<div></div>}
            stockList={stockListChart}
        ></Layout>
    </Container>
};

export default StockView;