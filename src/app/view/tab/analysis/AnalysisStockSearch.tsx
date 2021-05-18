import _ from "lodash";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Grid, Input, Table, Button } from "semantic-ui-react";
import { StockBasicInfoList } from "../../../client/types";
import { client } from "../../../client/WindClient";
import { useInputValue } from "../../../common/Util";
import { StateType } from "../../../state/Manager";
const AnalysisStockSearch: React.FC<{
    setSelectedStock: (id: string) => void;
}> = ({
    setSelectedStock
}) => {
        const defaultText = useSelector((state: StateType) => state.dataState.currentStock);
        const searchTextInput = useInputValue(defaultText || "");
        const [searchResult, setSearchResult] = useState<StockBasicInfoList>([]);
        const doStockSearch = () => {
            setSearchResult(_.take(client
                .getLocalStockBasicInfoList().filter(x => (x.id.includes(searchTextInput.value) || x.name.includes(searchTextInput.value))), 100));
        };


        return <Grid columns="1">
            <Grid.Column>
                <Input {...searchTextInput}
                    placeholder="搜索股票"
                    action={{
                        labelPosition: "right",
                        icon: "search",
                        content: "搜索",
                        onClick: doStockSearch
                    }} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.code === "Enter") {
                            doStockSearch();
                        }
                    }}></Input>
            </Grid.Column>
            <Grid.Column>
                <div style={{ overflowY: "scroll", height: "600px" }}>
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>股票代码</Table.HeaderCell>
                                <Table.HeaderCell>股票名称</Table.HeaderCell>
                                <Table.HeaderCell>操作</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {searchResult.map(item => (<Table.Row
                                key={item.id}
                            >
                                <Table.Cell>{item.id}</Table.Cell>
                                <Table.Cell>{item.name}</Table.Cell>
                                <Table.Cell>
                                    <Button size="tiny" color="green" onClick={() => setSelectedStock(item.id)}>
                                        选择
                                    </Button>
                                </Table.Cell>
                            </Table.Row>))}
                        </Table.Body>
                    </Table>
                </div>
            </Grid.Column>
        </Grid>;
    };

export default AnalysisStockSearch;
