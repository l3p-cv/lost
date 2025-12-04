import { CButton, CCollapse } from '@coreui/react'
import { faAngleDown, faAngleUp, faInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'

const CollapseCustom = ({
  initOpen = false,
  btnOutline = '',
  btnColor = 'secondary',
  icon = faInfo,
  iconColor = '#00294B',
  buttonText = 'More Information',
  children,
}) => {
  const [collapse, setCollapse] = useState(initOpen)

  const toggle = () => setCollapse(!collapse)

  return (
    <>
      <CButton
        variant={btnOutline}
        className="text-left m-1 p-2"
        color={btnColor}
        onClick={toggle}
        style={{ marginTop: 30, marginRight: 10, marginBottom: '1rem', width: '100%' }}
      >
        <h5 className="m-0 p-0">
          <FontAwesomeIcon icon={icon} color={iconColor} size="1x" />
          &nbsp;&nbsp;&nbsp;
          {buttonText}
          <div style={{ display: 'inline', float: 'right' }}>
            <FontAwesomeIcon
              icon={collapse ? faAngleUp : faAngleDown}
              color={iconColor}
              size="1x"
            />
          </div>
        </h5>
      </CButton>
      <CCollapse
        style={{
          marginTop: '15px',
          marginBottom: '5px',
          marginLeft: '5px',
          marginRight: '5px',
        }}
        visible={collapse}
      >
        {children}
      </CCollapse>
    </>
  )
}

export default CollapseCustom
