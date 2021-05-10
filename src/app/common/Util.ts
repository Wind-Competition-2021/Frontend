import { useEffect } from "react";
const wrapDocumentTitle = (title: string) => {
    return `${title} - 万得竞赛`;
};
const useDocumentTitle: (title: string) => void = (title: string) => {
    useEffect(() => {
        document.title = wrapDocumentTitle(title);
        return () => {
            document.title = "退群杯";
        };
    }, [title]);
};

export { useDocumentTitle };
