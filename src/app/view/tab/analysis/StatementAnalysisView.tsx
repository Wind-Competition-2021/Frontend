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


        return <Grid columns="2">
            <Grid.Column width="4">
                <AnalysisStockSearch
                    setSelectedStock={setCurrentStock}
                ></AnalysisStockSearch>
            </Grid.Column>
            <Grid.Column>
                {!currentStock ? <div></div> : <div>

                </div>}
            </Grid.Column>
        </Grid>;
    };

export default StatementAnalysisView;

