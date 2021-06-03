import { createStore, Action } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
// import { UserInfoType } from "../service/User";
/*
{
type: 'STOCKSTATE_UPDATE',
modify:(state) => {
      let result = {
        ...state,
        stockState: {
          ...state.stockState,
          tradingTime:false
        },
      };
      return result;
    }
}
*/
const defaultState = {

  viewState: {
    darkModeEnabled: false,
  },
  dataState: {
    loaded: false,
    currentStock: ""
  },
  stockState: {
    tradingTime: false,
    replaying: false,
    errorFetchingTradingTime: false
  }
};
export type StateType = typeof defaultState;
export interface SimpleAction extends Action<string> {
  readonly type: string;
  modify(arg0: StateType): StateType;
}
export function makeViewStateUpdateAction(viewState: StateType["viewState"]) {
  return {
    type: "VIEWSTATE_UPDATE",
    modify: (state: StateType) => {
      let result = {
        ...state,
        viewState: viewState,
      };
      return result;
    },
  } as SimpleAction;
}
export function makeDataStateUpdateAction(dataState: StateType["dataState"]) {
  return {
    type: "DATASTATE_UPDATE",
    modify: (state: StateType) => {
      let result = {
        ...state,
        dataState: dataState,
      };
      return result;
    },
  } as SimpleAction;
}
export function makeStockStateUpdateAction(stockState: StateType["stockState"]) {
  return {
    type: "STOCKSTATE_UPDATE",
    modify: (state: StateType) => {
      let result = {
        ...state,
        stockState: stockState,
      };
      return result;
    },
  } as SimpleAction;
}
export function makeCurrentStockAction(id: string) {
  return {
    type: "DATASTATE_UPDATE",
    modify: (state: StateType) => {
      let result = {
        ...state,
        dataState: {
          ...state.dataState,
          currentStock: id
        },
      };
      return result;
    },
  } as SimpleAction;
}

const myReducer = (state = defaultState, action: SimpleAction) => {
  // console.log(action);
  if (!action.type.startsWith("@@")) {
    return action?.modify(state);
  } else {
    return state;
  }
};
// const f = window as (typeof window &{__REDUX_DEVTOOLS_EXTENSION__:()=>void});
const store = createStore(myReducer, composeWithDevTools());

export { store };
