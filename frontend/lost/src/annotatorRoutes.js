import React from 'react'
import Loadable from 'react-loadable'

function Loading() {
  return <div>Loading...</div>
}

const Dashboard = Loadable({
  loader: () => import('./views/AnnotatorDashboard.js'),
  loading: Loading,
});

const SingleImageAnnotation = Loadable({
  loader: () => import('./views/SingleImageAnnotation.js'),
  loading: Loading,
});

const MultiImageAnnotation = Loadable({
  loader: () => import('./views/MultiImageAnnotation.js'),
  loading: Loading,
});

const Profile = Loadable({
  loader: () => import('./views/Profile.js'),
  loading: Loading,
})

const routes = [
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/sia', name: 'Single Image Annotation', component: SingleImageAnnotation },
  { path: '/mia', name: 'Multi Image Annotation', component: MultiImageAnnotation },
  { path: '/profile', name: 'My Profile', component: Profile },
  //{ path: '/users/:id', exact: true, name: 'User Details', component: User },
]

export default routes
