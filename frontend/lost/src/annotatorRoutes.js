import React from 'react'
import Loadable from 'react-loadable'

function Loading() {
  return <div>Loading...</div>
}

const Dashboard = Loadable({
  loader: () => import('./views/Dashboard/Annotator/AnnotatorDashboard.js'),
  loading: Loading,
});

const SingleImageAnnotation = Loadable({
  loader: () => import('./views/SIA/SingleImageAnnotation.js'),
  loading: Loading,
});

const MultiImageAnnotation = Loadable({
  loader: () => import('./views/MIA/MultiImageAnnotation.js'),
  loading: Loading,
});

const MyProfile = Loadable({
  loader: () => import('./views/Profile/Profile.js'),
  loading: Loading,
})

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/sia', name: 'Single Image Annotation', component: SingleImageAnnotation },
  { path: '/mia', name: 'Multi Image Annotation', component: MultiImageAnnotation },
  { path: '/profile', name: 'My Profile', component: MyProfile },
  //{ path: '/users/:id', exact: true, name: 'User Details', component: User },
]

export default routes
