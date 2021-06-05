import React, { useState } from "react";
import { Dimmer, Grid, Loader } from "semantic-ui-react";
import { StockInfo } from "../../../client/types";
import { client } from "../../../client/WindClient";
import AnalysisStockSearch from "./AnalysisStockSearch";
import StockDetailTable from "./StockDetailTable";

const StockDetailView: React.FC<{}> = () => {
    const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
    const [loading, setLoading] = useState(false);
    return <div>
        <Dimmer active={loading}>
            <Loader>加载中...</Loader>
        </Dimmer>
        <Grid columns="1">
            <Grid.Column>
                <Grid columns="2">
                    <Grid.Column>
                        <AnalysisStockSearch
                            setSelectedStock={v => {
                                (async () => {
                                    setLoading(true);
                                    try {
                                        setStockInfo(await client.getStockDetailedInfo(v));
                                    } catch (e) {
                                        throw e;
                                    } finally {
                                        setLoading(false);
                                    }
                                })();
                            }}
                        ></AnalysisStockSearch>
                    </Grid.Column>
                </Grid>
            </Grid.Column>
            <Grid.Column>
                {stockInfo && <StockDetailTable stockInfo={stockInfo}></StockDetailTable>}
            </Grid.Column>
        </Grid>
    </div>;
};

export default StockDetailView;