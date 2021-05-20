import React from "react";
import { ExtraCandleChartData, GeneralCandleChartData } from "../../../client/types";
import { Chart } from "react-google-charts";
// import { DateTime } from "luxon";
import { unwrapNumber } from "../../../common/Util";
import _ from "lodash";


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
    const candleChartData: CandleChartEntry[] = generalData.map(item => ({
        closing: myUnwrapNumber(item.closing),
        highest: myUnwrapNumber(item.highest),
        lowest: myUnwrapNumber(item.lowest),
        label: item.label,
        opening: myUnwrapNumber(item.opening)
    }));
    const prefixSum: number[] = generalData.map(item => myUnwrapNumber(item.closing, true).v);
    for (let i = 1; i < prefixSum.length; i++) {
        prefixSum[i] += prefixSum[i - 1];
    }
    /**
     * 用于绘制K线图的5日均价
     */
    const average5Data = prefixSum.map((x, i) => (x - (i <= 4 ? 0 : prefixSum[i - 5])) / (i <= 4 ? (i + 1) : 5));
    const volumeData = generalData.map(item => item.volume);
    const combinedData = _.zip(candleChartData, average5Data, volumeData).map(([a, b, c]) => [a!.label, a!.lowest, a!.opening, a!.closing, a!.highest, `最低: ${a!.lowest.f}<br>开盘: ${a!.opening.f}<br>收盘: ${a!.closing.f}<br>最高: ${a!.highest.f}`, b, c, (a!.opening.v <= a!.closing.v) ? "stroke-color:red;fill-color:red;fill-opacity:0.4" : "fill-color:blue"]);
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
    const maxVolume = _.max(combinedData.map(t => _.nth(t, -2)));
    const maxPrice = unwrapNumber(_.max(generalData.map(item => item.highest))!, true).value;
    const minPrice = unwrapNumber(_.min(generalData.map(item => item.lowest))!, true).value;
    const halfLen = (maxPrice - minPrice) / 2;
    console.log("max val", maxVolume);
    console.log("maxp", maxPrice, 'minp', minPrice, "halflen", halfLen);
    return <Chart
        // width="500px"
        // height="300px "
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
                        max: maxVolume as number * 5
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
