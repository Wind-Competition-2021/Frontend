import React from "react";
import { RealTimeDataByDay } from "../../../client/types";
import { Chart } from "react-google-charts";
import { DateTime } from "luxon";
import { unwrapNumber } from "../../../common/Util";
import _ from "lodash";


type DataEntry = { v: number; f: string; };

type CandleChartEntry = [string, DataEntry, DataEntry, DataEntry, DataEntry];
const myUnwrapNumber = (val: number, multi10000: boolean = false) => {
    const { value, display } = unwrapNumber(val, multi10000);
    return ({ v: value, f: display });
}
const StockCandleChart: React.FC<{
    data: RealTimeDataByDay[]
}> = ({ data }) => {
    /**
     * 用于绘制K线图
     */
    const candleChartData: CandleChartEntry[] = data.map(item => [
        DateTime.fromFormat(item.date, "yyyy-MM-dd").toFormat("MM/dd"),
        myUnwrapNumber(item.lowest, true),
        myUnwrapNumber(item.opening, true),
        myUnwrapNumber(item.closing, true),
        myUnwrapNumber(item.highest, true),
    ]);
    const prefixSum: number[] = data.map(item => myUnwrapNumber(item.closing, true).v);
    for (let i = 1; i < prefixSum.length; i++) {
        prefixSum[i] += prefixSum[i - 1];
    }
    /**
     * 用于绘制K线图的5日均价
     */
    const average5Data = prefixSum.map((x, i) => (x - (i <= 4 ? 0 : prefixSum[i - 5])) / (i <= 4 ? (i + 1) : 5));
    const volumeData = data.map(item => item.volume);
    const combinedData = _.zip(candleChartData, average5Data, volumeData).map(([a, b, c]) => [...a!, `最低: ${a![1].f}<br>开盘: ${a![2].f}<br>收盘: ${a![2].f}<br>最高: ${a![3].f}`, b, c, (a![2].v <= a![3].v) ? "stroke-color:red;fill-color:red;fill-opacity:0.4" : "fill-color:blue"]);
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
    return <Chart
        className="my-chart"
        chartType="ComboChart"
        data={[
            ["日期", "价格", "开盘价", "收盘价", "最高价", { role: "tooltip", type: "string", p: { html: true } }, "五日均价", "成交量", { role: "style" }],
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
                    color: "yellow"
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
                    }
                },
                1: {
                    title: "成交量",
                    gridlines: {
                        color: "transparent"
                    },
                    viewWindow: {
                        max: _.max(combinedData.map(_.last)) as number * 4
                    }
                }
            }
        }}
        chartEvents={[
            {
                eventName: "ready",
                callback: () => {
                    colorModifier();
                    document.querySelectorAll(".my-chart").forEach(item => {
                        item.addEventListener("mousemove", colorModifier);
                    });
                }
            }
        ]}

    >
    </Chart>;
}

export default StockCandleChart;
