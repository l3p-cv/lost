import React, { Component } from 'react'
import { connect } from 'react-redux'
import { HashRouter, Route, Switch } from 'react-router-dom'
import './App.scss'

import DefaultLayout  from './components/DefaultLayout/DefaultLayout'
import TimeOut  from './views/Pages/TimeOut/TimeOut'
import Login  from './views/Pages/Login/Login'
import Logout  from './views/Pages/Logout/Logout'
import Page404  from './views/Pages/Page404/Page404'

import actions from './actions/index'
const { checkExpireDateCron } = actions
class App extends Component {
  
  componentDidMount(){
      this.timer = setInterval(()=>  this.props.checkExpireDateCron(), 4000)
  }
  render() {
    return (
      <HashRouter>
        <Switch>
          <Route exact path='/timeout' name='Time Out' component={TimeOut} />
          <Route exact path='/login' name='Login Page' component={Login} />
          <Route exact path='/logout' name='Logout Page' component={Logout} />
          <Route exact path='/404' name='Page 404' component={Page404} />
          <Route path='/' name='Home' component={DefaultLayout} />
        </Switch>
      </HashRouter>
    )
  }
}


export default connect(null, { checkExpireDateCron })(App)
