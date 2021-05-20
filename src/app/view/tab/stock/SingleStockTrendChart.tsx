import _ from "lodash";
import { DateTime } from "luxon";
import React from "react";
import Chart from "react-google-charts";
import { StockTrendList } from "../../../client/types";
import { unwrapNumber } from "../../../common/Util";
const myUnwrapNumber = (val: number, multi10000: boolean = false) => {
    const { value, display } = unwrapNumber(val, multi10000);
    return ({ v: value, f: display });
}
const SingleStockTrendChart: React.FC<{
    data: StockTrendList
}> = ({ data }) => {
    const priceData = data.map(item => myUnwrapNumber(item.closing, true));
    const volumeData = _.zip(_.tail(data), _.initial(data.map(i => ({ closing: i.closing, volume: i.volume })))).map(([item, pre]) => [
        item!.volume - pre!.volume,
        (item!.closing >= pre!.closing) ? (
            (item!.closing === pre!.closing) ?
                "fill-color:white;stroke-color:black" :
                "fill-color:red;stroke-color:black"
        ) : "fill-color:green;stroke-color:black"
    ])
    // console.log("volume data",volumeData);
    const maxVolume = _.max(volumeData.map(t => t[0])) as number;
    const timeList = data.map((item, i) => DateTime.fromISO(item.time).toFormat("HH:mm"));
    const combinedData = _.zip(_.tail(timeList), _.tail(priceData), volumeData).map(([a, b, c]) => [a, b, ...c!]);
    // console.log("maxvol", maxVolume);
    // console.log(volumeData);
    return <Chart
        className="my-chart"
        chartType="ComboChart"
        data={[
            ["时间", "成交价", "成交量", { role: "style" }],
            ...combinedData
        ]}
        options={{
            hAxis: { title: "时间" },
            series: {
                0: {
                    targetAxisIndex: 0,
                    type: "lines",
                    color: "black"
                },
                1: {
                    targetAxisIndex: 1,
                    type: "bars"
                }
            },
            vAxes: {
                0: { title: "价格", gridlines: { color: "transparent" } },
                1: { title: "成交量", gridlines: { color: "transparent" }, viewWindow: { max: maxVolume! * 5 } }
            }
        }}
    ></Chart>;
}

export default SingleStockTrendChart;