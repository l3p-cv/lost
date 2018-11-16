import React, { Component } from 'react'
import { connect } from 'react-redux'
import jwt_decode from 'jwt-decode'
import actions from '../actions/index'
const { decodeJwt, checkExpireDate, checkRole } = actions


export default ChildComponent => {
  class ComposedComponent extends Component {
    // Our component just got rendered
    componentDidMount() {
      this.shouldNavigateAway()
    }

    // Our component just got updated
    componentDidUpdate() {
      this.shouldNavigateAway()
    }

    shouldNavigateAway() {
      if (!this.props.token) {
        this.props.history.push('/login')
      }else{
        let decoded_token = jwt_decode(this.props.token)
        this.props.decodeJwt(decoded_token)
        this.props.checkExpireDate(decoded_token, ()=> {
          this.props.history.push('/timeout')
        })
        this.props.checkRole(this.props.view, decoded_token)
      }
    }

    render() {
      return <ChildComponent {...this.props} />
    }
  } 

  function mapStateToProps(state) {
    return { token: state.auth.token, view: state.auth.view}
  }

  return connect(mapStateToProps, { decodeJwt, checkExpireDate, checkRole })(ComposedComponent)
}