import React from 'react'
import Loadable from 'react-loadable'

function Loading() {
  return <div>Loading...</div>
}


const StartPipeline = Loadable({
  loader: () => import('./views/Pipelines/StartPipeline.js'),
  loading: Loading,
})
const RunningPipeline = Loadable({
  loader: () => import('./views/Pipelines/RunningPipeline.js'),
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

const Workers = Loadable({
  loader: () => import('./views/Workers.js'),
  loading: Loading,
})

const SiaReview = Loadable({
  loader: () => import('./views/SiaReview.js'),
  loading: Loading,
})




// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/dashboard', name: 'Dashboard', component: RunningPipeline }, // first version just with pipelines in dashboard
  { path: '/start-pipeline', name: 'Start a Pipeline', component: StartPipeline },
  // { path: '/pipelines', name: 'Pipelines', component: Pipelines },
  { path: '/labels', name: 'Manage Labels', component: Label },
  { path: '/users', name: 'Manage Users', component: User },
  { path: '/workers', name: 'Workers', component: Workers },
  { path: '/profile', name: 'My Profile', component: Profile },
  { path: '/sia-review', name: 'Sia Review', component: SiaReview },
  //{ path: '/users/:id', exact: true, name: 'User Details', component: User },
]

export default routes
