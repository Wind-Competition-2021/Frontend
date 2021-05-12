import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeViewStateUpdateAction, StateType } from "./Manager";

const useDarkMode = () => {
    const dispatch = useDispatch();
    const { value } = useSelector((state: StateType) => ({
        value: state.viewState.darkModeEnabled,
    }));
    const update = useCallback(
        (enable: boolean) => {
            dispatch(makeViewStateUpdateAction({ darkModeEnabled: enable }));
        },
        [dispatch]
    );
    return [value, update] as [typeof value, typeof update];
};

const useBasicDataLoaded = () => {
    const value = useSelector((state: StateType) => state.dataState.loaded);
    return value;
};

export { useDarkMode, useBasicDataLoaded };
