interface Profit {

};
interface Operation {

};
interface Growth {

};
interface Balance {

};
interface CashFlow {

};
interface Dupond {

};
interface Report {

};
interface Forcast {

};
interface QuarterDataBundle {
    profit: Profit;
    operation: Operation;
    growth: Growth;
    balance: Balance;
    cashFlow: CashFlow;
    dupond: Dupond;
};

interface DateIntervalDataBundle {
    report: Report;
    forcast: Forcast;
};

export type {
    Balance,
    CashFlow,
    DateIntervalDataBundle,
    Dupond,
    Forcast,
    Growth,
    Operation,
    Profit,
    QuarterDataBundle,
    Report
};