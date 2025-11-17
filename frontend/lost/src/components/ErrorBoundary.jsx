import React from 'react'
import { CCol } from '@coreui/react'
import { withTranslation } from 'react-i18next'
import { faRotate } from '@fortawesome/free-solid-svg-icons'
import CoreIconButton from './CoreIconButton'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Example "componentStack":
    //   in ComponentThatThrows (created by App)
    //   in ErrorBoundary (created by App)
    //   in div (created by App)
    //   in App
    console.log(error)
  }

  render() {
    const { t } = this.props
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <>
          <CCol className="d-flex justify-content-center">
            <h1 style={{ color: 'red' }}>
              {/* {t('errorBoundary.anErrorOccured')} */}
              {'Sorry, it seems an error has occured'}
            </h1>
          </CCol>
          <br />
          <CCol className="d-flex justify-content-center">
            {/* <h2> {t('errorBoundary.pressButtonToReload')}</h2> */}
            <h2> {'Please reload'}</h2>
          </CCol>
          <br />
          <CCol className="d-flex justify-content-center">
            <CoreIconButton
              size={'lg'}
              text={'Reload'}
              icon={faRotate}
              color="success"
              onClick={() => {
                window.location.reload()
              }}
            />
          </CCol>
        </>
      )
    }

    return this.props.children
  }
}
export default withTranslation()(ErrorBoundary)
