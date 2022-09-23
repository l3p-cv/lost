import React, { Suspense } from 'react'
import axios from 'axios'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { store } from './store'
import { Provider } from 'react-redux'
import './scss/style.scss'
import enTranslation from './assets/locales/en'
import deTranslation from './assets/locales/de'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { flatObj } from './utils'
import { QueryClient, QueryClientProvider } from 'react-query'
import jwtDecode from 'jwt-decode'
import { API_URL } from './lost_settings'

const queryClient = new QueryClient()

// Containers

const resources = {
    en: {
        translation: flatObj(enTranslation),
    },
    de: {
        translation: flatObj(deTranslation),
    },
}
i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: 'en',

        keySeparator: true, // we do not use keys in form messages.welcome

        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    })

const TheLayout = React.lazy(() => import('./coreui_containers/TheLayout'))

// Pages
const Login = React.lazy(() => import('./containers/Login/Login'))
const Logout = React.lazy(() => import('./containers/Logout/Logout'))

const loading = () => {
    return <div>Loading</div>
}

function App() {
    const sendError = async (event) => {
        try {
            const error = event.error.stack
            const usedBrowser = event.currentTarget.clientInformation.userAgent
            const location = event.currentTarget.location.href
            const decodedToken = jwtDecode(localStorage.getItem('token'))
            let userId = null
            if (decodedToken) {
                userId = decodedToken.identity
            }
            const errorObj = {
                error,
                usedBrowser,
                location,
                userId,
            }

            await axios.post(`${API_URL}/system/logs/frontend`, errorObj)
        } catch {
            console.log('Error while sending error message to lost.')
        }
    }

    window.addEventListener('error', (event) => {
        sendError(event)
    })

    window.addEventListener('unhandledrejection', (event) => {
        sendError(event)
    })

    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <Suspense fallback={loading}>
                    <BrowserRouter>
                        <Switch>
                            <Route
                                exact
                                path="/login"
                                name="Login Page"
                                render={(props) => <Login {...props} />}
                            />
                            <Route
                                exact
                                path="/logout"
                                name="Logout Page"
                                component={Logout}
                            />
                            <Route path="/" name="Home" render={() => <TheLayout />} />
                        </Switch>
                    </BrowserRouter>
                </Suspense>
            </QueryClientProvider>
        </Provider>
    )
}

export default App
