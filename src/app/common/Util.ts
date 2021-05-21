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

const convertNumbers = function (valx: number, multi10000 = false): string {
    const negative = valx < 0 ? "-" : "";
    if (negative) valx *= -1;
    let val = valx.toString();
    if (valx < 10000) {
        val = _.padStart(valx.toString(), 5, "0");

    }
    if (multi10000) {
        //180000.0000 len=10
        const result = _.trimEnd(((val.slice(0, val.length - 4) || "0") + "." + val.slice(val.length - 4)), "0");
        if (result.match(/^.+\.[0-9]$/)) return negative + result + "0";
        else if (result.endsWith(".")) return negative + result + "00"
        else return negative + result;
    } return negative + val;
};

// const toPercent = (a: number, b: number) => {
//     const div = (a/b).toFixed()
// };

type onChangeType = ((event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => void);
const useInputValue: (text?: string) => { value: string; onChange: onChangeType } = (text: string = "") => {
    const [value, setValue] = useState(text);
    let onChange: onChangeType = useCallback((_, d) => {
        setValue(d.value);
    }, []);
    return { value, onChange };
};

const toDateString = (date: Date) => {
    return DateTime.fromJSDate(date).toFormat("yyyy-MM-dd");
};

const unwrapPercent = (valx: number) => {
    let val = _.padStart(valx.toString(), 6, "0");
    const negative = val[0] === '-';
    if (negative) val = val.substr(1);

    const head = val.substr(0, 2);
    const tail = val.substr(2);
    return {
        value: parseFloat(val) / 1e6,
        display: `${negative ? '-' : ''}${head}.${tail}%`
    };

};
/**
 * 拆包一个字符串表示的数，返回其浮点值和字符串表示的精确值
 * @param num 数字
 * @param multi10000 这个数字是否是乘过10000的
 * @returns 
 */
const unwrapNumber = (num: number, multi10000 = false) => {
    return ({ value: multi10000 ? num / 10000 : num, display: convertNumbers(num, multi10000) });
}
// (window as (typeof window) & {f:any}).f=convertNumbers;
export { useDocumentTitle, convertNumbers, useInputValue, toDateString, unwrapPercent, unwrapNumber };

export type { onChangeType }