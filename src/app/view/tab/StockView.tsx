import React, { useEffect, useState } from "react";
import { Button, Dimmer, Loader} from "semantic-ui-react";
// import { useDarkMode } from "../../state/Util";
import { useDocumentTitle } from "../../common/Util";
import _ from "lodash";
import Chart from "react-google-charts";

const StockView: React.FC<{}> = () => {
    // const [darkMode, setDarkMode] = useDarkMode();
    useDocumentTitle("主页");
    const [running, setRunning] = useState(false);
    const [data, setData] = useState<number[]>(_.range(1, 5));
    useEffect(() => {
        if (running) {
            let token = setTimeout(() => {
                console.log("updating..");
                setData(_.shuffle(data));
            }, 1000);
            return () => clearTimeout(token);
        }
    }, [running, data]);
    return <div>
        <Button onClick={() => setRunning(!running)}>{running ? "停止" : "开始"}</Button>
        <Chart
            chartType="Table"
            height={"500px"}
            loader={<Dimmer active>
                <Loader>加载中..</Loader>
            </Dimmer>}
            data={
                [
                    [{ type: "number", label: "编号" }, { type: "number", label: "数值" }],
                    ...data.map((x, i) => ([i + 1, x]))
                ]

            }
        ></Chart>
    </div>
};

export default StockView;