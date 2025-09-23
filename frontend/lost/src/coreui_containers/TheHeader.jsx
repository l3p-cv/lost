import { cilMenu } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CHeader, CHeaderBrand, CHeaderNav, CHeaderToggler } from '@coreui/react'
import TheHeaderDropdownAccount from './TheHeaderDropdownAccount'

const TheHeader = ({ numNavItems, canShowSidebar, setCanShowSidebar , showJoyride}) => {
    const renderSidebarToggler = () => {
        if (numNavItems) {
            if (numNavItems > 1) {
                return (
                    <>
                        <CHeaderToggler
                            className="ps-1"
                            onClick={() => setCanShowSidebar(!canShowSidebar)}
                        >
                            <CIcon icon={cilMenu} size="lg" />
                        </CHeaderToggler>
                    </>
                )
            }
        }
        return null
    }

    return (
        <CHeader>
            {renderSidebarToggler()}
            <CHeaderBrand className="mx-auto d-lg-none" to="/dashboard">
                <img alt="" style={{ height: 40 }} className="img-avatar" />
            </CHeaderBrand>

            <CHeaderNav className="px-3">
                {showJoyride}
                <TheHeaderDropdownAccount />
            </CHeaderNav>
        </CHeader>
    )
}

export default TheHeader
