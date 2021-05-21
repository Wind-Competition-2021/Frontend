interface StatementBase {
    id: string;
    publishDate: string;
    statDeadline: string;
}
interface Profitability extends StatementBase {
    roe: string;
    npm: string;
    gpm: string;
    np: number;
    eps: string;
    mbr: number;
    ts: number;
    cs: number;
};
interface OperationalCapability extends StatementBase {
    rtr: string;
    rtd: string;
    itr: string;
    itd: string;
    catr: string;
    tatr: string;
};
interface GrowthAbility extends StatementBase {
    nagr: string;
    tagr: string;
    npgr: string;
    bepsgr: string;
    npasgr: string;
};
interface Solvency extends StatementBase {
    cr: string;
    qr: string;
    car: string;
    tlgr: string;
    dar: string;
    em: string;
};
interface CashFlow extends StatementBase {
    catar: string;
    fatar: string;
    tatar: string;
    ipm: string;
    oncforr: string;
    oncfnpr: string;
    oncfgrr: string;

};
// interface Dupond extends StatementBase {

// };
interface Report extends StatementBase {
    updateDate: string;
    ta: string;
    na: string;
    epsgr: string;
    roew: string;
    epsd: string;
    grgr: string;
    opgr: string;
};
interface Forcast extends StatementBase {
    type: string;
    abstract: string;
    npasgrUpperLimit: string;
    npasgrLowerLimit: string;

};
interface QuarterDataBundle {
    profitability: Profitability;
    operationalCapability: OperationalCapability;
    growthAbility: GrowthAbility;
    solvency: Solvency;
    cashFlow: CashFlow;
    // dupond: Dupond;
};

interface DateIntervalDataBundle {
    report: Report;
    forcast: Forcast;
};
type StatementType = keyof QuarterDataBundle | keyof DateIntervalDataBundle;
type Quarter = 1 | 2 | 3 | 4;

type DateFormat = "date" | "quarter";
const typeSequence: StatementType[] = ["profitability", "operationalCapability", "growthAbility", "solvency", "cashFlow", "report", "forcast"]
const typeMapping = {
    report: { format: "quarter", title: "季频业绩快报" },
    forcast: { format: "quarter", title: "季频业绩预告" },
    profitability: { format: "date", title: "季频盈利能力" },
    operationalCapability: { format: "date", title: "季频营运能力" },
    growthAbility: { format: "date", title: "季频成长能力" },
    solvency: { format: "date", title: "季频偿债能力" },
    cashFlow: { format: "date", title: "季频现金流量" },
    // dupond: { format: "date", title: "季频杜邦指数" }
} as { [T in StatementType]: { format: DateFormat, title: string } };
export type {
    Solvency,
    CashFlow,
    DateIntervalDataBundle,
    // Dupond,
    Forcast,
    GrowthAbility,
    OperationalCapability,
    Profitability,
    QuarterDataBundle,
    Report,
    StatementBase,
    StatementType,
    Quarter
};

export {
    typeMapping, typeSequence
}