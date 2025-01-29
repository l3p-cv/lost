import { faAngleDown, faAngleUp, faInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { Button, Collapse } from 'reactstrap'

const CollapseCustom = ({
    initOpen = false,
    btnOutline = false,
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
            <Button
                block
                outline={btnOutline}
                className="text-left m-1 p-2"
                color={btnColor}
                onClick={toggle}
                style={{ marginTop: 30, marginRight: 10, marginBottom: '1rem' }}
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
            </Button>
            <Collapse
                style={{
                    marginTop: '15px',
                    marginBottom: '5px',
                    marginLeft: '5px',
                    marginRight: '5px',
                }}
                isOpen={collapse}
            >
                {children}
            </Collapse>
        </>
    )
}

export default CollapseCustom
