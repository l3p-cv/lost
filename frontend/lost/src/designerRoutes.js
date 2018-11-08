import React from 'react'
import Loadable from 'react-loadable'

function Loading() {
  return <div>Loading...</div>
}

const Dashboard = Loadable({
  loader: () => import('./views/DesignerDashboard/DesignerDashboard.js'),
  loading: Loading,
})

const Label = Loadable({
  loader: () => import('./components/Label.js'),
  loading: Loading,
})

const User = Loadable({
  loader: () => import('./components/User.js'),
  loading: Loading,
})

const Group = Loadable({
  loader: () => import('./components/Group.js'),
  loading: Loading,
})



// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/labels', name: 'Manage Labels', component: Label },
  { path: '/users', name: 'Manage Users', component: User },
  { path: '/groups', name: 'Manage Groups', component: Group },
  //{ path: '/users/:id', exact: true, name: 'User Details', component: User },
]

export default routes
