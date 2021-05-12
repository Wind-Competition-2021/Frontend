import { createStore, Action } from "redux";
// import { UserInfoType } from "../service/User";

const defaultState = {
  // userState: {
  //     login: false,
  //     userData: ({
  //         username: "",
  //         email: "",
  //     } as UserInfoType)
  // },
  // dataState: {
  //     loaded: false
  // }
  viewState: {
    darkModeEnabled: false,
  },
  dataState: {
    loaded: false
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

const myReducer = (state = defaultState, action: SimpleAction) => {
  if (!action.type.startsWith("@@redux")) {
    return action.modify(state);
  } else {
    return state;
  }
};

const store = createStore(myReducer);

export { store };
