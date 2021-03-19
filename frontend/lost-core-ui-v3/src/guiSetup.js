import DashboardComponent from './containers/Dashboard'
import StartPipelineComponent from './containers/StartPipeline'
const Dashboard = {
    name: '/Dashboard',
    to: '/dashboard',
    component: DashboardComponent
}


const StartPipeline = {
    name: '/StartPipeline',
    to: '/start_pipeline',
    component: StartPipelineComponent
}



const guiSetup = {
    additionalRoutes: [

    ],
    Administrator: {
        redirect: '/dashboard',
        navItems: [
            Dashboard,
            StartPipeline
        ]
    }
}


export default guiSetup