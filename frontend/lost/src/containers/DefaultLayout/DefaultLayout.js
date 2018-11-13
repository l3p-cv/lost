import React, {Component} from 'react'
import {Redirect, Route, Switch} from 'react-router-dom'
import {Container} from 'reactstrap'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {
    AppAside,
    AppBreadcrumb,
    AppFooter,
    AppHeader,
    AppSidebar,
    AppSidebarFooter,
    AppSidebarForm,
    AppSidebarHeader,
    AppSidebarMinimizer,
    AppSidebarNav
} from '@coreui/react'
// sidebar nav config
import desginerNavigation from '../../designerNavigation'
// routes config
import designerRoutes from '../../designerRoutes'
import annotaterRoutes from '../../annotaterRoutes'
import DefaultAside from './DefaultAside'
import DefaultFooter from './DefaultFooter'
import DesignerHeader from './DesignerHeader'
import AnnotaterHeader from './AnnotaterHeader'
import requireAuth from '../../components/requireAuth'

class DefaultLayout extends Component {

    render() {
        if (this.props.view !== undefined) {
            if (this.props.view === 'Designer') {
                return this.renderDesigner()
            }
        }
        return this.renderAnnotater()

    }

    renderDesigner() {
        return (
            <div className='app'>
                <AppHeader fixed>
                    <DesignerHeader/>
                </AppHeader>
                <div className='app-body'>
                    <AppSidebar fixed display='lg'>
                        <AppSidebarHeader/>
                        <AppSidebarForm/>
                        <AppSidebarNav navConfig={desginerNavigation} {...this.props}/>
                        <AppSidebarFooter/>
                        <AppSidebarMinimizer/>
                    </AppSidebar>
                    <main className='main'>
                        <AppBreadcrumb appRoutes={designerRoutes}/>
                        <Container fluid>
                            <Switch>
                                {designerRoutes.map((route, idx) => {
                                    return route.component
                                        ? (
                                            <Route
                                                key={idx}
                                                path={route.path}
                                                exact={route.exact}
                                                name={route.name}
                                                render={props => (<route.component {...props}/>)}/>
                                        )
                                        : (null)
                                },)}
                                <Redirect from='/' to='/dashboard'/>
                            </Switch>
                        </Container>
                    </main>
                    <AppAside fixed>
                        <DefaultAside/>
                    </AppAside>
                </div>
                <AppFooter>
                    <DefaultFooter/>
                </AppFooter>
            </div>
        )
    }

    renderAnnotater() {
        return (
            <div className='app'>
                <AppHeader fixed>
                    <AnnotaterHeader/>
                </AppHeader>
                <div className='app-body'>
                    <main className='main'>
                        <AppBreadcrumb appRoutes={annotaterRoutes}/>
                        <Container fluid>
                            <Switch>
                                {annotaterRoutes.map((route, idx) => {
                                    return route.component
                                        ? (
                                            <Route
                                                key={idx}
                                                path={route.path}
                                                exact={route.exact}
                                                name={route.name}
                                                render={props => (<route.component {...props}/>)}/>
                                        )
                                        : (null)
                                },)}
                                <Redirect from='/' to='/dashboard'/>
                            </Switch>
                        </Container>
                    </main>
                    <AppAside fixed>
                        <DefaultAside/>
                    </AppAside>
                </div>
                <AppFooter>
                    <DefaultFooter/>
                </AppFooter>
            </div>
        )
    }
}
function mapStateToPropse(state) {
    return {view: state.auth.view}
}

export default compose(connect(mapStateToPropse), requireAuth)(DefaultLayout)
