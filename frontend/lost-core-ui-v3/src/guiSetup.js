import DashboardComponent from './containers/Dashboard'
import StartPipelineComponent from './containers/StartPipeline'
import LabelsComponent from './containers/Labels'
import WorkersComponent from './containers/Workers'
import {
    FaTachometerAlt,
    FaPlay,
    FaTag,
    FaCubes,
    FaUsers
} from 'react-icons/fa'

const iconProps = {
    className: 'c-sidebar-nav-icon',
    size: 20,
    style: {
        marginRight: 10
        }
}


const Dashboard = {
    name: 'Dashboard',
    to: '/dashboard',
    component: DashboardComponent,
    icon: <FaTachometerAlt {...iconProps} />,
}

const TitlePipeline = {
    title: true,
    name: 'Pipelines'
}

const StartPipeline = {
    name: 'Start Pipeline',
    to: '/start_pipeline',
    component: StartPipelineComponent,
    icon: <FaPlay {...iconProps} />,
}

const TitleProject = {
    title: true,
    name: 'Project'
}

const Labels = {
    name: 'Labels',
    to: '/labels',
    component: LabelsComponent,
    icon: <FaTag {...iconProps} />,
}

const Workers = {
    name: 'Workers',
    to: '/workers',
    component: WorkersComponent,
    icon: <FaCubes {...iconProps} />,

}


const Users = {
    name: 'Users',
    to: '/users',
    component: WorkersComponent,
    icon: <FaUsers {...iconProps} />,

}



const guiSetup = {
    additionalRoutes: [

    ],
    Administrator: {
        redirect: '/dashboard',
        navItems: [
            Dashboard,
            TitlePipeline,
            StartPipeline,
            TitleProject,
            Labels,
            Workers,
            Users
        ]
    }
}


export default guiSetup