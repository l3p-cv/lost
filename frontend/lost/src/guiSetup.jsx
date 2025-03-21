import AdminAreaComponent from './containers/AdminArea/AdminArea'
import AnnotasksReviewComponent from './containers/Annotation/AnnoTask/ReviewPage'
import AnnotationTableComponent from './containers/Annotation/AnnotationTable'
import MiaComponent from './containers/Annotation/MultiImageAnnotation'
import SiaReviewComponent from './containers/Annotation/SIAReviewAnnotation'
import SiaComponent from './containers/Annotation/SingleImageAnnotation'
import DataSourcesComponent from './containers/DataSources/DataSources'
import DatasetsComponent from './containers/Datasets/Datasets'
import DatasetsReviewComponent from './containers/Datasets/ReviewPage'
import LabelsComponent from './containers/Labels/LabelDashboard'
import MyProfileComponent from './containers/Profile/Profile'
import DesignerStatisticsComponent from './containers/Statistics/DesignerStatistics'

import {
    FaBox,
    FaChartLine,
    FaDatabase,
    FaPaintBrush,
    FaPlay,
    FaTachometerAlt,
    FaTag,
    FaTasks,
    FaTools,
} from 'react-icons/fa'
import PersonalStatistics from './containers/Statistics/PersonalStatistics'
import { PipelineView } from './containers/pipeline/running/PipelineView'
import { RunningPipelines } from './containers/pipeline/running/RunningPipelines'
import { PipelineTemplatesTable } from './containers/pipeline/start/PipelineTemplatesTable'
import { TemplateView } from './containers/pipeline/start/TemplateView'

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

const RunningPipelinesPage = {
    name: 'Pipelines',
    to: '/pipelines',
    component: RunningPipelines,
    icon: <FaTasks {...iconProps} />,
}

const PipelinePage = {
    path: '/pipeline/:pipelineId',
    // exact: true,
    component: PipelineView,
}

const PipelineTemplatesPage = {
    name: 'Start Pipeline',
    to: '/pipeline-templates',
    component: PipelineTemplatesTable,
    icon: <FaPlay {...iconProps} />,
}

const TemplatePage = {
    path: '/pipeline-template/:templateId',
    component: TemplateView,
    exact: true,
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
    additionalRoutes: [
        Sia,
        Mia,
        MyProfile,
        SiaReview,
        AnnotaskReview,
        DatasetsReview,
        PipelinePage,
        TemplatePage,
    ],
    Administrator: {
        redirect: '/dashboard',
        navItems: [
            DesignerDashboard,
            TitleProject,
            RunningPipelinesPage,
            PipelineTemplatesPage,
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
            RunningPipelinesPage,
            PipelineTemplatesPage,
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
