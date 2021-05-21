import _ from "lodash";
import React, { useState } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Search, Label } from "semantic-ui-react";
import { client } from "../../../client/WindClient";
import { StateType } from "../../../state/Manager";
const AnalysisStockSearch: React.FC<{
    setSelectedStock: (id: string) => void;
}> = ({
    setSelectedStock
}) => {
        const defaultText = useSelector((state: StateType) => state.dataState.currentStock);
        const [searchText, setSearchText] = useState(defaultText || "");
        const [searchResult, setSearchResult] = useState<{ title: string; stockid: string }[]>([]);
        const [loaded, setLoaded] = useState(false);
        const doStockSearch = (text: string) => {
            setSearchResult(_.take(client
                .getLocalFullStockBasicInfoList().filter(x => (x.id.includes(text) || x.name.includes(text))), 5).map(item => ({ stockid: item.id, title: item.name })));
        };
        useEffect(() => {
            if (!loaded) {
                doStockSearch(defaultText);
                setLoaded(true);
            }
        }, [loaded, defaultText]);
        return <div>
            <Search
                value={searchText}
                onSearchChange={(_, d) => {
                    setSearchText(d.value!);
                    doStockSearch(d.value!);
                }}
                resultRenderer={p => {
                    // console.log(p);
                    return <div><Label>{p.stockid}</Label>{p.title}</div>;
                }}
                results={searchResult}
                onResultSelect={(_, d) => {
                    setSearchText(d.result.stockid);
                    setSelectedStock(d.result.stockid);
                }}
            ></Search>
        </div>
    };

export default AnalysisStockSearch;
