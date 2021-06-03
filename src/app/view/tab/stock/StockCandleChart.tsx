import React, { useState } from "react";
import { ExtraCandleChartData, GeneralCandleChartData } from "../../../client/types";
import { toDateStringLuxon, unwrapNumber, unwrapPercent } from "../../../common/Util";
import _ from "lodash";
import { Dimmer, Loader } from "semantic-ui-react";

import ReactECharts from "echarts-for-react";
import { useEffect } from "react";
import { client } from "../../../client/WindClient";
import { DateTime } from "luxon";
import { useDarkModeValue } from "../../../state/Util";
type DataEntry = { name: string; value: number };
interface CandleChartEntry {
    label: string;
    opening: DataEntry;
    closing: DataEntry;
    highest: DataEntry;
    lowest: DataEntry;
};
const myUnwrapNumber = (val: number, multi10000: boolean = false) => {
    const { value, display } = unwrapNumber(val, multi10000);
    return ({ value: value, name: display }) as DataEntry;
}

const WrappedStockCandleChart: React.FC<{
    stock: string;
    beginDate?: Date;
    endDate?: Date;

}> = React.memo(({ stock, beginDate, endDate }) => {
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<GeneralCandleChartData | null>(null);
    const today = DateTime.now();
    let begin = beginDate ? DateTime.fromJSDate(beginDate) : today.minus({ day: 30 });
    const end = endDate ? DateTime.fromJSDate(endDate) : today;
    if (end.diff(begin, "days").days < 30) {
        begin = end.minus({ day: 30 });
    }
    useEffect(() => {
        if (!loaded) {
            (async () => {
                setLoading(true);
                try {
                    const resp = await client.getStockDayHistory(stock, toDateStringLuxon(begin), toDateStringLuxon(end));
                    setData(resp.map(item => ({
                        ...item, label: DateTime.fromISO(item.date).toFormat("MM/dd")
                    })))
                    setLoading(false);
                    setLoaded(true);

                } catch (e) {
                    throw e;
                } finally {
                    setLoading(false);
                }

            })();
        }
    }, [loaded, stock, begin, end]);
    return <div>
        {(!loaded) ? <div className="my-charts">
            <Dimmer active={loading}>
                <Loader>加载中</Loader>
            </Dimmer>
        </div> : <StockCandleChart generalData={data!}></StockCandleChart>}
    </div>
});

const StockCandleChart: React.FC<{
    generalData: GeneralCandleChartData
    extraData?: ExtraCandleChartData
}> = ({ generalData, extraData }) => {
    const darkMode = useDarkModeValue();
    /**
     * 用于绘制K线图
     */
    // console.log(extraData);
    const candleChartData: CandleChartEntry[] = generalData.map(item => ({
        closing: myUnwrapNumber(item.closing, true),
        highest: myUnwrapNumber(item.highest, true),
        lowest: myUnwrapNumber(item.lowest, true),
        label: item.label,
        opening: myUnwrapNumber(item.opening, true)
    }));
    const [loading, setLoading] = useState(true);
    const prefixSum: number[] = generalData.map(item => myUnwrapNumber(item.closing, true).value);
    for (let i = 1; i < prefixSum.length; i++) {
        prefixSum[i] += prefixSum[i - 1];
    }
    /**
     * 用于绘制K线图的5日均价
     */
    const average5Data = prefixSum.map((x, i) => (x - (i <= 4 ? 0 : prefixSum[i - 5])) / (i <= 4 ? (i + 1) : 5)).map(x => ({ name: x.toFixed(2), value: x }));
    const volumeData = generalData.map(item => ({
        volume: item.volume,
        turnover: myUnwrapNumber(item.turnover, true)
    }));
    const ratesData = extraData?.map(i => ({
        per: unwrapPercent(i.per).display,
        psr: unwrapPercent(i.psr).display,
        pcfr: unwrapPercent(i.pcfr).display,
        pbr: unwrapPercent(i.pbr).display,
        tr: unwrapPercent(i.turnoverRate).display,
    }))
    const combinedCandleData = candleChartData.map(x => [x.opening, x.closing, x.lowest, x.highest].map(i => i.value));
    const maxVolume = _.max(volumeData.map(t => t.volume));
    const maxPrice = unwrapNumber(_.max(generalData.map(item => item.highest))!, true).value;
    const minPrice = unwrapNumber(_.min(generalData.map(item => item.lowest))!, true).value;
    const halfLen = (maxPrice - minPrice) / 2;
    const combinedVolumeData = _.zip(volumeData, candleChartData).map(([x, y]) => ({
        value: x!.volume,
        itemStyle: (y!.opening.value <= y!.closing.value) ? ({ color: "red", borderColor: "red", borderWidth: 1, opacity: 0.5 }) : ({ color: "blue" })

    }));
    return <div>
        <Dimmer active={loading}>
            <Loader>加载中</Loader>
        </Dimmer>
        {loading && <div className="my-chart"></div>}
        <ReactECharts
            className="my-charts"
            onEvents={{
                finished: () => setLoading(false)
            }}
            option={{
                backgroundColor: darkMode ? "black" : "white",
                darkMode: darkMode,
                tooltip: {
                    trigger: 'item',
                    axisPointer: {
                        type: 'cross'
                    }
                },
                legend: {
                    data: ["K线图", "五日均线", "成交量"]
                },
                xAxis: {
                    type: "category",
                    data: candleChartData.map(i => i.label),
                    scale: true,
                    min: "dataMin",
                    max: "dataMax",
                },
                yAxis: [
                    {
                        name: "价格",
                        scale: true,
                        min: Math.round(minPrice - halfLen),
                        splitLine: { show: false }
                    },
                    {
                        name: "成交量",
                        scale: true,
                        max: maxVolume as number * 2,
                        splitLine: { show: false }
                    }
                ],
                dataZoom: [
                    {
                        show: true,
                        type: 'slider',
                        top: '90%',
                        start: 0,
                        end: 100
                    }
                ],
                series: [
                    {
                        name: "K线图",
                        type: "candlestick",
                        data: combinedCandleData,
                        yAxisIndex: 0,
                        tooltip: {
                            formatter(params: any, ticket: any) {
                                // console.log(params,ticket);
                                const values = params.value as number[];
                                const index = values[0];
                                const item = candleChartData[index];
                                const extra = ratesData ? ratesData[index] : undefined;
                                return `${item.label}<br>
                                    最低: ${item.lowest.name}<br>
                                    开盘: ${item.opening.name}<br>
                                    收盘: ${item.closing.name}<br>
                                    最高: ${item.highest.name}` + (extra !== undefined ? `
                                    <br><br>换手率:${extra.tr}%<br>
                                        市盈率:${extra.per}%<br>
                                        市销率:${extra.psr}%<br>
                                        市现率:${extra.pcfr}%<br>
                                        市净率:${extra.pbr}%
                                        `: "");
                            }
                        }
                    },
                    {
                        name: "五日均线",
                        type: "line",
                        data: average5Data,
                        lineStyle: {
                            color: "yellow"
                        },
                        yAxisIndex: 0,
                        showSymbol: false,
                        tooltip: {
                            formatter(params: any) {
                                const index = params.dataIndex as number;
                                const label = candleChartData[index].label;
                                const average5 = average5Data[index].name;
                                return `${label}<br>五日均价: ${average5}`;
                            }
                        }
                    },
                    {
                        name: "成交量",
                        type: "bar",
                        yAxisIndex: 1,
                        data: combinedVolumeData
                    }
                ]
            }}
        ></ReactECharts>
    </div>;
}

export {
    WrappedStockCandleChart,
    StockCandleChart
};
