import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import actions from "../../actions";

import BaseContainer from "../../components/BaseContainer";

const AnnotatorDashboard = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(actions.setNavbarVisible(true));
  }, []);

  return <BaseContainer>ToDo for Annotator.</BaseContainer>;
};
export default AnnotatorDashboard;
