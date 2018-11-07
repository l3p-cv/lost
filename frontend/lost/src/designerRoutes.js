import React from 'react';
import Loadable from 'react-loadable'

function Loading() {
  return <div>Loading...</div>;
}

const Dashboard = Loadable({
  loader: () => import('./views/DesignerDashboard/DesignerDashboard.js'),
  loading: Loading,
});
const StartPipeline = Loadable({
  loader: () => import('./components/StartPipeline.js'),
  loading: Loading,
});
const Pipelines = Loadable({
  loader: () => import('./components/Pipelines.js'),
  loading: Loading,
});



// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/start-pipeline', name: 'Start a Pipeline', component: StartPipeline },
  { path: '/pipelines', name: 'Pipelines', component: Pipelines },
  //{ path: '/users/:id', exact: true, name: 'User Details', component: User },
];

export default routes;
