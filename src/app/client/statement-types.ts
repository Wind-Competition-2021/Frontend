interface StatementBase {
    id: string;
    publishDate: string;
    statDeadline: string;
}
interface Profitability extends StatementBase {
    roe: number;
    npm: number;
    gpm: number;
    np: number;
    eps: number;
    mbr: number;
    ts: number;
    cs: number;
};
interface OperationalCapability extends StatementBase {
    rtr: number;
    rtd: number;
    itr: number;
    itd: number;
    catr: number;
    tatr: number;
};
interface GrowthAbility extends StatementBase {
    nagr: number;
    tagr: number;
    npgr: number;
    bepsgr: number;
    npasgr: number;
};
interface Solvency extends StatementBase {
    cr: number;
    qr: number;
    car: number;
    tlgr: number;
    dar: number;
    em: number;
};
interface CashFlow extends StatementBase {
    catar: number;
    fatar: number;
    tatar: number;
    ipm: number;
    oncforr: number;
    oncfnpr: number;
    oncfgrr: number;

};
// interface Dupond extends StatementBase {

// };
// interface PerformanceReport extends StatementBase {
//     updateDate: string;
//     ta: number;
//     na: number;
//     epsgr: number;
//     roew: number;
//     epsd: number;
//     grgr: number;
//     opgr: number;
// };
// interface PerformanceForcast extends StatementBase {
//     type: string;
//     abstract: string;
//     npasgrUpperLimit: number;
//     npasgrLowerLimit: number;

// };
interface QuarterDataBundle {
    profitability: Profitability;
    operationalCapability: OperationalCapability;
    growthAbility: GrowthAbility;
    solvency: Solvency;
    cashFlow: CashFlow;
    // dupond: Dupond;
};

// interface DateIntervalDataBundle {
//     performanceReport?: PerformanceReport;
//     performanceForcast?: PerformanceForcast;
// };
type AllBundle = QuarterDataBundle ;
type StatementType = keyof QuarterDataBundle ;
type Quarter = 1 | 2 | 3 | 4;

type DateFormat = "date" | "quarter";
const dateFormatMapping = {
    date: "快报预报",
    quarter: "季频数据"
} as Record<DateFormat, string>;
const dateFormatSequence: DateFormat[] = ["quarter", "date"];
const typeSequence: StatementType[] = ["profitability", "operationalCapability", "growthAbility", "solvency", "cashFlow"]
const typeMapping = {
    performanceReport: { format: "date", title: "季频业绩快报" },
    performanceForcast: { format: "date", title: "季频业绩预告" },
    profitability: { format: "quarter", title: "季频盈利能力" },
    operationalCapability: { format: "quarter", title: "季频营运能力" },
    growthAbility: { format: "quarter", title: "季频成长能力" },
    solvency: { format: "quarter", title: "季频偿债能力" },
    cashFlow: { format: "quarter", title: "季频现金流量" },
    // dupond: { format: "date", title: "季频杜邦指数" }
} as { [T in StatementType]: { format: DateFormat, title: string } };
export type {
    Solvency,
    CashFlow,
    // DateIntervalDataBundle,
    // Dupond,
    // PerformanceForcast,
    GrowthAbility,
    OperationalCapability,
    Profitability,
    QuarterDataBundle,
    // PerformanceReport,
    StatementBase,
    StatementType,
    Quarter,
    AllBundle,
    DateFormat
};

export {
    typeMapping, typeSequence, 
    dateFormatMapping, dateFormatSequence
}