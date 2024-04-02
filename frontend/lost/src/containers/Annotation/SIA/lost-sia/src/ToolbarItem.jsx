import { CNavItem } from "@coreui/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import './Toolbar.css'

const ToolbarItem = ({ active = false, disabled = false, faIcon, siaIcon, onClick }) => {

    let color = 'white'
    if (active) color = 'red'
    if (disabled) color = 'grey'

    return (<CNavItem>
        <div className="sia-toolbar-item"
            onClick={() => {
                if (!disabled && onClick) onClick()
            }}
        >
            {faIcon && <FontAwesomeIcon icon={faIcon} size='lg' color={color} />}
            {siaIcon && <span style={{ color: color }}>
                {siaIcon}
            </span>}
        </div>
    </CNavItem>)
}

export default ToolbarItem