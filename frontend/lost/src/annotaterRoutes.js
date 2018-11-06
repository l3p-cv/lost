import React from 'react';
import Loadable from 'react-loadable'

function Loading() {
  return <div>Loading...</div>;
}

const Dashboard = Loadable({
  loader: () => import('./views/AnnotaterDashboard/AnnotaterDashboard.js'),
  loading: Loading,
});
const SIA = Loadable({
  loader: () => import('./components/SIA.js'),
  loading: Loading,
});



// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/sia', name: 'SIA', component: SIA },
  //{ path: '/users/:id', exact: true, name: 'User Details', component: User },
];

export default routes;
