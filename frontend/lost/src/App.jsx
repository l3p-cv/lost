import axios from 'axios'
import i18n from 'i18next'
import { jwtDecode } from 'jwt-decode'
import React, { Suspense } from 'react'
import { initReactI18next } from 'react-i18next'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import deTranslation from './assets/locales/de.json'
import enTranslation from './assets/locales/en.json'
import { CenteredSpinner } from './components/CenteredSpinner'
import { LostConfigProvider } from './contexts/LostConfigContext'
import { API_URL } from './lost_settings'
import './scss/style.scss'
import { flatObj } from './utils'
import OidcCallbackHandler from './containers/Authentication/OidcCallbackHandler'

const queryClient = new QueryClient()
const resources = {
  en: {
    translation: flatObj(enTranslation),
  },
  de: {
    translation: flatObj(deTranslation),
  },
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
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
const Login = React.lazy(() => import('./containers/Authentication/Login'))
const Logout = React.lazy(() => import('./containers/Authentication/Logout'))

function App() {
  const sendError = async (event) => {
    try {
      const error = event.error.stack
      const usedBrowser = event.currentTarget.clientInformation.userAgent
      const location = event.currentTarget.location.href
      const decodedToken = jwtDecode(localStorage.getItem('token'))

      const userId = decodedToken?.identity ?? null

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

  globalThis.addEventListener('error', (event) => {
    sendError(event)
  })

  globalThis.addEventListener('unhandledrejection', (event) => {
    sendError(event)
  })

  return (
    <QueryClientProvider client={queryClient}>
      <LostConfigProvider>
        <Suspense fallback={<CenteredSpinner color="white" />}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              <Route
                path="/*"
                element={
                  <OidcCallbackHandler>
                    <TheLayout />
                  </OidcCallbackHandler>
                }
              />
            </Routes>
          </BrowserRouter>
        </Suspense>
      </LostConfigProvider>
    </QueryClientProvider>
  )
}

export default App
