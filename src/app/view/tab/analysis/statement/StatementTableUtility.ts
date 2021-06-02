import { AllBundle, StatementBase, StatementType } from "../../../../client/statement-types";

interface FormatMapping<Statement extends StatementBase> {
    key: keyof Statement;
    title: string;
    mapper: (val: Statement) => string | number | null;
};

const formats = {
    profitability: [
        { key: "roe", title: "股本回报率", mapper: s => s["roe"] },
        { key: "npm", title: "净利润率", mapper: s => s["npm"] },
        { key: "gpm", title: "毛利率", mapper: s => s["gpm"] },
        { key: "np", title: "净利润", mapper: s => s["np"]?.toFixed(2) },
        { key: "eps", title: "每股收益", mapper: s => s["eps"]?.toFixed(2) },
        { key: "mbr", title: "主营业务收入", mapper: s => s["mbr"]?.toFixed(2) },
        { key: "ts", title: "股份总数", mapper: s => s["ts"]?.toFixed(0) },
        { key: "cs", title: "流通股", mapper: s => s["cs"]?.toFixed(0) },
    ],
    operationalCapability: [
        { key: "rtr", title: "应收账款周转率", mapper: s => s["rtr"] },
        { key: "rtd", title: "应收周转天数", mapper: s => s["rtd"]?.toFixed(0) },
        { key: "itr", title: "存货周转率", mapper: s => s["itr"] },
        { key: "itd", title: "月库存天数", mapper: s => s["itd"]?.toFixed(0) },
        { key: "catr", title: "流动资产周转率", mapper: s => s["catr"] },
        { key: "tatr", title: "总资产周转率", mapper: s => s["tatr"] },
    ],
    growthAbility: [
        { key: "nagr", title: "净资产增长率", mapper: s => s["nagr"] },
        { key: "tagr", title: "总资产增长率", mapper: s => s["tagr"] },
        { key: "npgr", title: "净利润增长率", mapper: s => s["npgr"] },
        { key: "bepsgr", title: "基本每股收益增长率", mapper: s => s["bepsgr"] },
        { key: "npasgr", title: "归属于股东的净利润增长率", mapper: s => s["npasgr"] },
    ],
    solvency: [
        { key: "cr", title: "流动比率", mapper: s => s["cr"] },
        { key: "qr", title: "速动比率", mapper: s => s["qr"] },
        { key: "car", title: "现金资产比率", mapper: s => s["car"] },
        { key: "tlgr", title: "总负债增长率", mapper: s => s["tlgr"] },
        { key: "dar", title: "负债资产比率", mapper: s => s["dar"] },
        { key: "em", title: "权益乘数", mapper: s => s["em"]?.toFixed(2) },

    ],
    cashFlow: [
        { key: "catar", title: "流动资产除以总资产", mapper: s => s["catar"] },
        { key: "fatar", title: "固定资产除以总资产", mapper: s => s["fatar"] },
        { key: "tatar", title: "有形除以总资产", mapper: s => s["tatar"] },
        { key: "ipm", title: "已获利息倍数", mapper: s => s["ipm"]?.toFixed(2) },
        { key: "oncforr", title: "营业净现金流量与营业收入之比", mapper: s => s["oncforr"] },
        { key: "oncfnpr", title: "营业净现金流量与净利润比率", mapper: s => s["oncfnpr"] },
        { key: "oncfgrr", title: "营业净现金流与总收入之比", mapper: s => s["oncfgrr"] },
    ],
    performanceReport: [
        { key: "updateDate", title: "更新日期", mapper: s => s["updateDate"] },
        { key: "ta", title: "总资产", mapper: s => s["ta"]?.toFixed(2) },
        { key: "na", title: "净资产", mapper: s => s["na"]?.toFixed(2) },
        { key: "epsgr", title: "每股收益增长率", mapper: s => s["epsgr"] },
        { key: "roew", title: "权益加权比率", mapper: s => s["roew"] },
        { key: "epsd", title: "稀释每股收益", mapper: s => s["epsd"] },
        { key: "grgr", title: "增长收入增长率", mapper: s => s["grgr"] },
        { key: "opgr", title: "营业利润增长率", mapper: s => s["opgr"] },
    ],
    performanceForcast: [
        { key: "type", title: "类型", mapper: s => s["type"] },
        { key: "abstract", title: "摘要", mapper: s => s["abstract"] },
        { key: "npasgrUpperLimit", title: "预告归属于母公司的净利润增长上限", mapper: s => s["npasgrUpperLimit"] },
        { key: "npasgrLowerLimit", title: "预告归属于母公司的净利润增长下限", mapper: s => s["npasgrLowerLimit"] },

    ]

} as { [Key in StatementType]: FormatMapping<AllBundle[Key]>[] };


export type {
    FormatMapping
}
export {
    formats
}