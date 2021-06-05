import React from "react";
import { Table } from "semantic-ui-react";
import { SemanticWIDTHS } from "semantic-ui-react/dist/commonjs/generic";
import "./InformationItem.css"
const AnalysisInformationItem: React.FC<{ title: React.ReactNode; colSpan?: number; width?: SemanticWIDTHS; rowSpan?: number; centered?: boolean; }> = ({
    title, children, colSpan, width, rowSpan, centered
}) => {
    return <>
        <Table.Cell textAlign={centered ? "center" : undefined} width={width} rowspan={rowSpan} className="my-table-header">{title}</Table.Cell>
        {children && <Table.Cell colspan={colSpan}>{children}</Table.Cell>}
    </>
};

export default AnalysisInformationItem;