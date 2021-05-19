// import { DateTime } from "luxon";
import React, { useState } from "react";
import { Grid } from "semantic-ui-react";
import { useDocumentTitle } from "../../../common/Util";
import AnalysisStockSearch from "./AnalysisStockSearch";

const StatementAnalysisView: React.FC<{
}> = () => {
    useDocumentTitle("分析");
    /**
     * 当前要分析的股票
     */
    const [currentStock, setCurrentStock] = useState<string | null>(null);
    // const today = DateTime.now();
    // /**
    //  * 日期区间起始
    //  */
    // const [beginDate, setBeginDate] = useState<Date>(today.minus({ days: 30 }).toJSDate());
    // /**
    //  * 日期区间结束
    //  */
    // const [endDate, setEndDate] = useState<Date>(today.toJSDate());
    // /**
    //  * 年份
    //  */
    // const [year, setYear] = useState<number>(today.year);
    // /**
    //  * 季度
    //  */
    // const [quarter, setQuarter] = useState<number>(today.quarter);


    return <Grid columns="2">
        <Grid.Column width="6">
            <AnalysisStockSearch
                setSelectedStock={setCurrentStock}
            ></AnalysisStockSearch>
        </Grid.Column>
        <Grid.Column width="10">
            {!currentStock ? <div></div> : <div>

            </div>}
        </Grid.Column>
    </Grid>;
};

export default StatementAnalysisView;

