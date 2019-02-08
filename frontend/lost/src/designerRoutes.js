import React from 'react'
import Loadable from 'react-loadable'

function Loading() {
  return <div>Loading...</div>
}

const Dashboard = Loadable({
  loader: () => import('./views/DesignerDashboard.js'),
  loading: Loading,
})

const StartPipeline = Loadable({
  loader: () => import('./views/StartPipeline.js'),
  loading: Loading,
})

const Label = Loadable({
  loader: () => import('./views/Labels.js'),
  loading: Loading,
})

const User = Loadable({
  loader: () => import('./views/Users.js'),
  loading: Loading,
})

const Profile = Loadable({
  loader: () => import('./views/Profile.js'),
  loading: Loading,
})



// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/dashboard', name: 'Dashboard', component: Dashboard }, // first version just with pipelines in dashboard
  { path: '/start-pipeline', name: 'Start a Pipeline', component: StartPipeline },
  // { path: '/pipelines', name: 'Pipelines', component: Pipelines },
  { path: '/labels', name: 'Manage Labels', component: Label },
  { path: '/users', name: 'Manage Users', component: User },
  { path: '/profile', name: 'My Profile', component: Profile },
  //{ path: '/users/:id', exact: true, name: 'User Details', component: User },
]

export default routes
