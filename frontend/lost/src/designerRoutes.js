import React from 'react'
import Loadable from 'react-loadable'

function Loading() {
  return <div>Loading...</div>
}

const Dashboard = Loadable({
  loader: () => import('./views/Dashboard/Designer/DesignerDashboard.js'),
  loading: Loading,
})
const StartPipeline = Loadable({
  loader: () => import('./views/Pipelines/StartPipeline.js'),
  loading: Loading,
})
const Pipelines = Loadable({
  loader: () => import('./views/Pipelines/Pipelines.js'),
  loading: Loading,
})

const Label = Loadable({
  loader: () => import('./views/Labels/Labels.js'),
  loading: Loading,
})

const User = Loadable({
  loader: () => import('./views/Users/Users.js'),
  loading: Loading,
})

const MyProfile = Loadable({
  loader: () => import('./views/Profile/Profile.js'),
  loading: Loading,
})



// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/start-pipeline', name: 'Start a Pipeline', component: StartPipeline },
  { path: '/pipelines', name: 'Pipelines', component: Pipelines },
  { path: '/labels', name: 'Manage Labels', component: Label },
  { path: '/users', name: 'Manage Users', component: User },
  { path: '/profile', name: 'My Profile', component: MyProfile },
  //{ path: '/users/:id', exact: true, name: 'User Details', component: User },
]

export default routes
