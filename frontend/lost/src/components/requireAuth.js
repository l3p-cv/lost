import React, { Component } from 'react';
import { connect } from 'react-redux';
import jwt_decode from 'jwt-decode';
import * as actions from '../actions';
export default ChildComponent => {
  class ComposedComponent extends Component {
    // Our component just got rendered
    componentDidMount() {
      this.shouldNavigateAway();
    }

    // Our component just got updated
    componentDidUpdate() {
      this.shouldNavigateAway();
    }

    shouldNavigateAway() {
      if (!this.props.token) {
        this.props.history.push('/login');
      }else{
        this.props.decodeJwt(jwt_decode(this.props.token),
        ()=> {
          this.props.history.push('/timeout');
        });
      }
    }

    render() {
      return <ChildComponent {...this.props} />;
    }
  } 

  function mapStateToProps(state) {
    return { token: state.auth.token};
  }

  return connect(mapStateToProps, actions)(ComposedComponent);
};