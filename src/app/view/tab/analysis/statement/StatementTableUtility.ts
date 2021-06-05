import { AllBundle, StatementBase, StatementType } from "../../../../client/statement-types";

type FormatMapping<Statement extends StatementBase> ={
    // key: keyof Statement;
    title: string;
    mapper: (val: Statement) => string | number | null;
};

const formats = {
    profitability:
    {
        roe: { title: "股本回报率", mapper: s => s["roe"] },
        npm: { title: "净利润率", mapper: s => s["npm"] },
        gpm: { title: "毛利率", mapper: s => s["gpm"] },
        np: { title: "净利润", mapper: s => s["np"]?.toFixed(2) },
        eps: { title: "每股收益", mapper: s => s["eps"]?.toFixed(2) },
        mbr: { title: "主营业务收入", mapper: s => s["mbr"]?.toFixed(2) },
        ts: { title: "股份总数", mapper: s => s["ts"]?.toFixed(0) },
        cs: { title: "流通股", mapper: s => s["cs"]?.toFixed(0) }
    },

    operationalCapability: {
        rtr: { title: "应收账款周转率", mapper: s => s["rtr"] },
        rtd: { title: "应收周转天数", mapper: s => s["rtd"]?.toFixed(0) },
        itr: { title: "存货周转率", mapper: s => s["itr"] },
        itd: { title: "月库存天数", mapper: s => s["itd"]?.toFixed(0) },
        catr: { title: "流动资产周转率", mapper: s => s["catr"] },
        tatr: { title: "总资产周转率", mapper: s => s["tatr"] },
    },
    growthAbility: {
        nagr: { title: "净资产增长率", mapper: s => s["nagr"] },
        tagr: { title: "总资产增长率", mapper: s => s["tagr"] },
        npgr: { title: "净利润增长率", mapper: s => s["npgr"] },
        bepsgr: { title: "基本每股收益增长率", mapper: s => s["bepsgr"] },
        npasgr: { title: "归属于股东的净利润增长率", mapper: s => s["npasgr"] },
    },
    solvency: {
        cr: { title: "流动比率", mapper: s => s["cr"] },
        qr: { title: "速动比率", mapper: s => s["qr"] },
        car: { title: "现金资产比率", mapper: s => s["car"] },
        tlgr: { title: "总负债增长率", mapper: s => s["tlgr"] },
        dar: { title: "负债资产比率", mapper: s => s["dar"] },
        em: { title: "权益乘数", mapper: s => s["em"]?.toFixed(2) },

    },
    cashFlow: {
        catar: { title: "流动资产除以总资产", mapper: s => s["catar"] },
        fatar: { title: "固定资产除以总资产", mapper: s => s["fatar"] },
        tatar: { title: "有形除以总资产", mapper: s => s["tatar"] },
        ipm: { title: "已获利息倍数", mapper: s => s["ipm"]?.toFixed(2) },
        oncforr: { title: "营业净现金流量与营业收入之比", mapper: s => s["oncforr"] },
        oncfnpr: { title: "营业净现金流量与净利润比率", mapper: s => s["oncfnpr"] },
        oncfgrr: { title: "营业净现金流与总收入之比", mapper: s => s["oncfgrr"] },
    },
    // performanceReport: {
    //     updateDate: { title: "更新日期", mapper: s => s["updateDate"] },
    //     ta: { title: "总资产", mapper: s => s["ta"]?.toFixed(2) },
    //     na: { title: "净资产", mapper: s => s["na"]?.toFixed(2) },
    //     epsgr: { title: "每股收益增长率", mapper: s => s["epsgr"] },
    //     roew: { title: "权益加权比率", mapper: s => s["roew"] },
    //     epsd: { title: "稀释每股收益", mapper: s => s["epsd"] },
    //     grgr: { title: "增长收入增长率", mapper: s => s["grgr"] },
    //     opgr: { title: "营业利润增长率", mapper: s => s["opgr"] },
    // },
    // performanceForcast: {
    //     type: { title: "类型", mapper: s => s["type"] },
    //     abstract: { title: "摘要", mapper: s => s["abstract"] },
    //     npasgrUpperLimit: { title: "预告归属于母公司的净利润增长上限", mapper: s => s["npasgrUpperLimit"] },
    //     npasgrLowerLimit: { title: "预告归属于母公司的净利润增长下限", mapper: s => s["npasgrLowerLimit"] },

    // },
} as { [Key in StatementType]: { [Key2 in keyof AllBundle[Key]]: FormatMapping<AllBundle[Key]> } };


export type {
    FormatMapping
}
export {
    formats
}