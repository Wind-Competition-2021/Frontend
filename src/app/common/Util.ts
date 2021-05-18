import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { InputOnChangeData } from "semantic-ui-react";
import { DateTime } from "luxon";
const wrapDocumentTitle = (title: string) => {
    return `${title} - 万得竞赛`;
};
const useDocumentTitle: (title: string) => void = (title: string) => {
    useEffect(() => {
        document.title = wrapDocumentTitle(title);
        return () => {
            document.title = "万得竞赛";
        };
    }, [title]);
};

const convertNumbers = function (valx: number, multi10000 = false) {
    const val = valx.toString();
    if (multi10000) {
        //180000.0000 len=10
        const result = _.trimEnd((val.slice(0, val.length - 4) + "." + val.slice(val.length - 4)), "0");
        if (result.endsWith(".0")) return result + "0";
        else if (result.endsWith(".")) return result + "00"
        else return result;
    } return val;
};
type onChangeType = ((event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => void);
const useInputValue: (text?: string) => { value: string; onChange: onChangeType } = (text: string = "") => {
    const [value, setValue] = useState(text);
    let onChange: onChangeType = useCallback((_, d) => {
        setValue(d.value);
    }, []);
    return { value, onChange };
};

const toDateString = (date: Date) => {
    return DateTime.fromJSDate(date).toFormat("YYYY-MM-DD");
};

const unwrapPercent = (val: string) => {
    const head = val.substr(0, 3);
    const tail = val.substr(3, 3);
    return {
        value: parseFloat(val) / 1e5,
        display: `${head}.${tail}%`
    };

};

// (window as (typeof window) & {f:any}).f=convertNumbers;
export { useDocumentTitle, convertNumbers, useInputValue, toDateString, unwrapPercent };

export type { onChangeType }