import _ from "lodash";
import { useEffect } from "react";
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
// (window as (typeof window) & {f:any}).f=convertNumbers;
export { useDocumentTitle, convertNumbers };
