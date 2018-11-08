import React from 'react'
import Loadable from 'react-loadable'

function Loading() {
  return <div>Loading...</div>
}

const Dashboard = Loadable({
  loader: () => import('./views/AnnotaterDashboard/AnnotaterDashboard.js'),
  loading: Loading,
});
const SingleImageAnnotation = Loadable({
  loader: () => import('./components/SingleImageAnnotation.js'),
  loading: Loading,
});


// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/sia', name: 'Single Image Annotation', component: SingleImageAnnotation },
  //{ path: '/users/:id', exact: true, name: 'User Details', component: User },
]

export default routes
