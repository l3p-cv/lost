import RunningPipelineComponent from './containers/pipeline/running/RunningPipeline'
import StartPipelineComponent from './containers/pipeline//start/StartPipeline'
import LabelsComponent from './containers/Labels/LabelDashboard'
import AnnotationTableComponent from './containers/Annotation/AnnotationTable'
import SiaComponent from './containers/Annotation/SingleImageAnnotation'
import SiaReviewComponent from './containers/Annotation/SIAReviewAnnotation'
import MiaComponent from './containers/Annotation/MultiImageAnnotation'
import DatasetsComponent from './containers/Datasets/Datasets'
import DatasetsReviewComponent from './containers/Datasets/ReviewPage'
import AnnotasksReviewComponent from './containers/Annotation/AnnoTask/ReviewPage'
import DataSourcesComponent from './containers/DataSources/DataSources'
import MyProfileComponent from './containers/Profile/Profile'

// import PipelinesComponent from './containers/Pipelines/Pipelines'

import AdminAreaComponent from './containers/AdminArea/AdminArea'
import DesignerStatisticsComponent from './containers/Statistics/DesignerStatistics'

import {
    FaTachometerAlt,
    FaPlay,
    FaTag,
    FaPaintBrush,
    FaDatabase,
    FaTools,
    FaTasks,
    FaChartLine,
    FaBox,
} from 'react-icons/fa'
import PersonalStatistics from './containers/Statistics/PersonalStatistics'

const iconProps = {
    size: 20,
    className: 'c-sidebar-nav-icon',
    style: {
        marginRight: 10,
    },
}

const DesignerDashboard = {
    name: 'Dashboard',
    to: '/dashboard',
    component: PersonalStatistics,
    icon: <FaTachometerAlt {...iconProps} />,
}

const AnnotatorDashboard = {
    name: 'Dashboard',
    to: '/dashboard',
    component: PersonalStatistics,
    icon: <FaTachometerAlt {...iconProps} />,
}

const DesignerStatistics = {
    name: 'Statistics',
    to: '/statistics',
    component: DesignerStatisticsComponent,
    icon: <FaChartLine {...iconProps} />,
}

const TitleProject = {
    title: true,
    name: 'Project',
}

const TitleAdmin = {
    title: true,
    name: 'Administration',
}

const TitleAnnotation = {
    title: true,
    name: 'Annotation',
}

const Labels = {
    name: 'Labels',
    to: '/labels',
    component: LabelsComponent,
    icon: <FaTag {...iconProps} />,
}

const Datasets = {
    name: 'Datasets',
    to: '/datasets',
    component: DatasetsComponent,
    icon: <FaBox {...iconProps} />,
}

const DatasetsReview = {
    path: '/datasets/:datasetId/review',
    component: DatasetsReviewComponent,
}

const AnnotaskReview = {
    path: '/annotasks/:annotaskId/review',
    component: AnnotasksReviewComponent,
}

const DataSources = {
    name: 'Datasources',
    to: '/datasources',
    component: DataSourcesComponent,
    icon: <FaDatabase {...iconProps} />,
}

const Annotation = {
    name: 'Annotation',
    to: '/annotation',
    component: AnnotationTableComponent,
    icon: <FaPaintBrush {...iconProps} />,
}

const Sia = {
    path: '/sia/*',
    component: SiaComponent,
}

const SiaReview = {
    path: '/sia-review/*',
    component: SiaReviewComponent,
}

const Mia = {
    path: '/mia/*',
    component: MiaComponent,
}

const RunningPipelines = {
    name: 'Pipelines',
    to: '/pipelines',
    component: RunningPipelineComponent,
    icon: <FaTasks {...iconProps} />,
}

const StartPipelines = {
    name: 'Start Pipeline',
    to: '/startpipeline',
    component: StartPipelineComponent,
    icon: <FaPlay {...iconProps} />,
}

const AdminArea = {
    name: 'Admin Area',
    to: '/admin_area',
    component: AdminAreaComponent,
    icon: <FaTools {...iconProps} />,
}

const MyProfile = {
    path: '/my_profile/*',
    component: MyProfileComponent,
}

const guiSetup = {
    additionalRoutes: [Sia, Mia, MyProfile, SiaReview, AnnotaskReview, DatasetsReview],
    Administrator: {
        redirect: '/dashboard',
        navItems: [
            DesignerDashboard,
            TitleProject,
            RunningPipelines,
            StartPipelines,
            Labels,
            Datasets,
            DataSources,
            DesignerStatistics,
            TitleAnnotation,
            Annotation,
            TitleAdmin,
            AdminArea,
        ],
    },
    Designer: {
        redirect: '/dashboard',
        navItems: [
            DesignerDashboard,
            TitleProject,
            RunningPipelines,
            StartPipelines,
            Labels,
            Datasets,
            DataSources,
            DesignerStatistics,
            TitleAnnotation,
            Annotation,
        ],
    },
    Annotator: {
        redirect: '/annotation',
        navItems: [AnnotatorDashboard, Annotation],
    },
}

export default guiSetup
