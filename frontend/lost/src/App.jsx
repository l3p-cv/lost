import axios from 'axios'
import i18n from 'i18next'
import { jwtDecode } from 'jwt-decode'
import React, { Suspense } from 'react'
import { initReactI18next } from 'react-i18next'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import deTranslation from './assets/locales/de'
import enTranslation from './assets/locales/en'
import { CenteredSpinner } from './components/CenteredSpinner'
import { LostConfigProvider } from './contexts/LostConfigContext'
import { API_URL } from './lost_settings'
import './scss/style.scss'
import { store } from './store'
import { flatObj } from './utils'
const queryClient = new QueryClient()

// Containers
const IS_DEV = true
const VITE_BACKEND_PORT = 80
let apiUrl = ''
let socketUrl = ''
if (IS_DEV) {
    apiUrl = `${window.location.origin.replace(/:\d+?$/, '')}:${VITE_BACKEND_PORT}/api`
    socketUrl = `${window.location.origin.replace(/:\d+?$/, '')}:${VITE_BACKEND_PORT}`
} else {
    apiUrl = `${window.location.origin}/api`
    socketUrl = `${window.location.origin}`
}
window.API_URL = apiUrl
window.SOCKET_URL = socketUrl
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
                <LostConfigProvider>
                    <Suspense fallback={<CenteredSpinner color="white" />}>
                        <BrowserRouter>
                            <Routes>
                                <Route
                                    path="/login"
                                    name="Login Page"
                                    element={<Login />}
                                />
                                <Route
                                    path="/logout"
                                    name="Logout Page"
                                    element={<Logout />}
                                />
                                <Route path="/*" name="Home" element={<TheLayout />} />
                            </Routes>
                        </BrowserRouter>
                    </Suspense>
                </LostConfigProvider>
            </QueryClientProvider>
        </Provider>
    )
}

export default App
