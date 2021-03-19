import React, { Suspense } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { store } from './store';
import { Provider } from 'react-redux';
import './scss/style.scss'

// Containers
const TheLayout = React.lazy(() => import('./coreui_containers/TheLayout'))

// Pages
const Login = React.lazy(() => import('./containers/Login'))
const Logout = React.lazy(() => import('./containers/Logout'))

const loading = () => {
    return <div>Loading</div>
}


const App = () => (
    <Provider store={store}>
    <Suspense fallback={loading}>
    <BrowserRouter>
        <Switch>
            <Route exact path="/login" name="Login Page" render={(props) => <Login {...props} />} />
            <Route exact path="/logout" name="Logout Page" component={Logout} />
            <Route path="/" name="Home" render={() => <TheLayout />} />
        </Switch>
    </BrowserRouter>
    </Suspense>
    </Provider>

)

export default App
