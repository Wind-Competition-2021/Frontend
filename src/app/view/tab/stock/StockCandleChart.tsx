import React, { useState } from "react";
import { ExtraCandleChartData, GeneralCandleChartData } from "../../../client/types";
import { Chart } from "react-google-charts";
// import { DateTime } from "luxon";
import { unwrapNumber, unwrapPercent } from "../../../common/Util";
import _ from "lodash";
import { Dimmer, Loader } from "semantic-ui-react";


type DataEntry = { v: number; f: string; };

interface CandleChartEntry {
    label: string;
    opening: DataEntry;
    closing: DataEntry;
    highest: DataEntry;
    lowest: DataEntry;
};
const myUnwrapNumber = (val: number, multi10000: boolean = false) => {
    const { value, display } = unwrapNumber(val, multi10000);
    return ({ v: value, f: display });
}
const StockCandleChart: React.FC<{
    generalData: GeneralCandleChartData
    extraData?: ExtraCandleChartData
}> = ({ generalData, extraData }) => {
    /**
     * 用于绘制K线图
     */
    console.log(extraData);
    const candleChartData: CandleChartEntry[] = generalData.map(item => ({
        closing: myUnwrapNumber(item.closing, true),
        highest: myUnwrapNumber(item.highest, true),
        lowest: myUnwrapNumber(item.lowest, true),
        label: item.label,
        opening: myUnwrapNumber(item.opening, true)
    }));
    const [loading, setLoading] = useState(true);
    const prefixSum: number[] = generalData.map(item => myUnwrapNumber(item.closing, true).v);
    for (let i = 1; i < prefixSum.length; i++) {
        prefixSum[i] += prefixSum[i - 1];
    }
    /**
     * 用于绘制K线图的5日均价
     */
    const average5Data = prefixSum.map((x, i) => (x - (i <= 4 ? 0 : prefixSum[i - 5])) / (i <= 4 ? (i + 1) : 5));
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
    const tempProcess=(num:number)=>{
        return (num/1e4).toFixed(2);
    }
    const combinedData = _.zip(candleChartData, average5Data, volumeData, ratesData || []).map(([a, b, c, d]) => [
        //标签
        a!.label,
        //K线
        a!.lowest, a!.opening, a!.closing, a!.highest,
        `${a!.label}<br>
        最低: ${a!.lowest.f}<br>
        开盘: ${a!.opening.f}<br>
        收盘: ${a!.closing.f}<br>
        最高: ${a!.highest.f}
        `+ (d !== undefined ? `
        <br>换手率:${d!.tr}%<br>
        市盈率:${d!.per}%<br>
        市销率:${d!.psr}%<br>
        市现率:${d!.pcfr}%<br>
        市净率:${d!.pbr}%
        `: ""),
        //五日均价
        b,
        //成交量
        c!.volume, (a!.opening.v <= a!.closing.v) ? "stroke-color:red;fill-color:red;fill-opacity:0.4" : "fill-color:blue",
        `${a!.label}<br>成交量:${c!.volume}<br>成交额:<br>${tempProcess(c!.turnover.v)}万元`
    ]);
    // console.log(combinedData);
    const colorModifier = () => {
        document.querySelectorAll("rect[width='2']").forEach(item => {
            // console.log("modify", item);
            const majorRect = item.nextSibling as (Element | null);
            if (majorRect) {
                const color = majorRect.getAttribute("fill");
                item.setAttribute("fill", color || "");
            }

        });
    };
    const maxVolume = _.max(volumeData.map(t => t.volume));
    const maxPrice = unwrapNumber(_.max(generalData.map(item => item.highest))!, true).value;
    const minPrice = unwrapNumber(_.min(generalData.map(item => item.lowest))!, true).value;
    const halfLen = (maxPrice - minPrice) / 2;
    return <div>
        <Dimmer active={loading}>
            <Loader>加载中</Loader>
        </Dimmer>
        {loading && <div className="my-chart"></div>}
        <Chart
            className="my-chart"
            chartType="ComboChart"
            data={[
                ["日期", "价格", "开盘价", "收盘价", "最高价", { role: "tooltip", type: "string", p: { html: true } }, "五日均价", "成交量", { role: "style" }, { role: "tooltip", type: "string", p: { html: true } }],
                ...combinedData
            ]}
            options={{
                tooltip: {
                    isHtml: true
                },
                hAxis: { title: "日期" },
                seriesType: "candlesticks",
                series: {
                    0: {
                        targetAxisIndex: 0,
                        type: "candlesticks",
                        candlestick: {
                            fallingColor: {
                                fill: "blue",//收盘小于开盘，蓝色
                                stroke: "blue",
                                strokeWidth: "blue"
                            },
                            risingColor: {
                                fill: "red",//收盘大于开盘，红色
                                stroke: "red",
                                strokeWidth: "red"
                            }
                        }
                    },
                    1: {
                        targetAxisIndex: 0,
                        type: "line",
                        color: "yellow",
                    },
                    2: {
                        targetAxisIndex: 1,
                        type: "bars"
                    }
                },
                vAxes: {
                    0: {
                        title: "价格",
                        gridlines: {
                            color: "transparent"
                        },
                        viewWindow: {
                            min: minPrice - halfLen
                        }
                    },
                    1: {
                        title: "成交量",
                        gridlines: {
                            color: "transparent"
                        },
                        viewWindow: {
                            max: maxVolume as number * 4
                        }
                    }
                }
            }}
            chartEvents={[
                {
                    eventName: "ready",
                    callback: () => {
                        setLoading(false);
                        colorModifier();
                        document.querySelectorAll(".my-chart").forEach(item => {
                            item.addEventListener("mousemove", colorModifier);
                        });
                    }
                }
            ]}
        >
        </Chart>
    </div>;
}

export default StockCandleChart;
