import TYPES from "../types/index";
const INITIAL_STATE = {
  trees: [],
  createLabelMessage: "",
  updateLabelMessage: "",
  deleteLabelMessage: "",
  createLabelTreeMessage: "",
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case TYPES.GET_LABEL_TREES:
      return {
        ...state,
        trees: action.payload,
      };
    case TYPES.UPDATE_LABEL_SUCCESS:
      return {
        ...state,
        updateLabelMessage: "success",
      };
    case TYPES.UPDATE_LABEL_FAILED:
      return {
        ...state,
        updateLabelMessage: action.payload,
      };
    case TYPES.CREATE_LABEL_SUCCESS:
      return {
        ...state,
        createLabelMessage: "success",
      };
    case TYPES.CREATE_LABEL_FAILED:
      return {
        ...state,
        createLabelMessage: action.payload,
      };
    case TYPES.DELETE_LABEL_SUCCESS:
      return {
        ...state,
        deleteLabelMessage: "success",
      };
    case TYPES.DELETE_LABEL_FAILED:
      return {
        ...state,
        deleteLabelMessage: action.payload,
      };
    case TYPES.CREATE_LABEL_TREE_SUCCESS:
      return {
        ...state,
        createLabelTreeMessage: "success",
      };
    case TYPES.CREATE_LABEL_TREE_FAILED:
      return {
        ...state,
        createLabelTreeMessage: action.payload,
      };
    case TYPES.CLEAN_LABEL_MESSAGES:
      return {
        ...state,
        deleteLabelMessage: "",
        updateLabelMessage: "",
        createLabelMessage: "",
        createLabelTreeMessage: "",
      };
    default:
      return state;
  }
}
