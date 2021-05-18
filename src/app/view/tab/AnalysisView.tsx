import React, { useState } from "react";
import { useEffect } from "react";
import { useDocumentTitle } from "../../common/Util";

const AnalysisView: React.FC<{}> = () => {
    useDocumentTitle("分析");
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        if (!loaded) {
            
        }
    }, [loaded]);
    return <div>qwq</div>;
};

export default AnalysisView;
