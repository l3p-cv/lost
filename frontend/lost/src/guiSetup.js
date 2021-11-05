import DesignerDashboardComponent from "./containers/DesignerDashboard/DesignerDashboard";
import AnnotatorDashboardComponent from "./containers/AnnotatorDashboard/AnnotatorDashboard";
import StartPipelineComponent from "./containers/pipeline//start/StartPipeline";
import LabelsComponent from "./containers/Labels/LabelDashboard";
import WorkersComponent from "./containers/Workers/WorkersTable";
import UsersComponent from "./containers/Users/UsersAndGroups";
import AnnotationTableComponent from "./containers/Annotation/AnnotationTable";
import SiaComponent from "./containers/Annotation/SingleImageAnnotation";
import SiaReviwComponent from "./containers/Annotation/SIAReviewAnnotation";
import MiaComponent from "./containers/Annotation/MultiImageAnnotation";
import DataSourcesComponent from "./containers/DataSources/DataSources";
import MyProfileComponent from "./containers/Profile/Profile";

import PipelinesComponent from "./containers/Pipelines/Pipelines";
import AdminAreaComponent from "./containers/AdminArea/AdminArea";

import {
    FaTachometerAlt,
    FaPlay,
    FaTag,
    FaCubes,
    FaUsers,
    FaPaintBrush,
    FaDatabase,
    FaTools,
    FaTasks,
} from 'react-icons/fa'

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
    // component: DesignerDashboardComponent,
    component: PipelinesComponent,
    icon: <FaTachometerAlt {...iconProps} />,
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
  name: "Labels",
  to: "/labels",
  component: LabelsComponent,
  icon: <FaTag {...iconProps} />,
};

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
    path: '/sia',
    exact: false,
    component: SiaComponent,
}

const SiaReview = {
    path: '/sia-review',
    exact: false,
    component: SiaReviwComponent,
}

const Mia = {
    path: '/mia',
    exact: false,
    component: MiaComponent,
}

const Pipelines = {
  name: "Pipelines",
  to: "/pipelines",
  component: PipelinesComponent,
  icon: <FaTasks {...iconProps} />,
};

const AdminArea = {
  name: "Admin Area",
  to: "/admin_area",
  component: AdminAreaComponent,
  icon: <FaTools {...iconProps} />,
};

const MyProfile = {
    path: '/my_profile',
    exact: false,
    component: MyProfileComponent,
}

const guiSetup = {
    additionalRoutes: [Sia, Mia, MyProfile, SiaReview],
    Administrator: {
        redirect: '/dashboard',
        navItems: [
            DesignerDashboard,
            TitleProject,
            Pipelines,
            Labels,
            DataSources,
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
            Pipelines,
            Labels,
            DataSources,
            TitleAnnotation,
            Annotation,
        ],
    },
    Annotator: {
        redirect: '/annotation',
        navItems: [Annotation],
    },
}

export default guiSetup
