import { CButton } from '@coreui/react'
import { faArrowLeft, faArrowRight, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PropTypes from 'prop-types'

const IconButton = ({
    isBack,
    loadingSize = '2x',
    isLoading = false,
    isForward,
    margin,
    icon,
    text,
    size,
    isTextLeft,
    style,
    type = 'button',
    disabled,
    onClick,
    className = '',
    color = 'primary',
    isOutline = true,
}) => {
    let iconButtonIcon
    if (isBack) {
        iconButtonIcon = faArrowLeft
    } else if (isForward) {
        iconButtonIcon = faArrowRight
    } else {
        iconButtonIcon = icon
    }

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center">
                    <FontAwesomeIcon
                        className="mr-3"
                        size={loadingSize || '2x'}
                        icon={faSync}
                        spin
                    />
                    <span className="text-center">Loading</span>
                </div>
            )
        }
        const ic = iconButtonIcon ? (
            <FontAwesomeIcon key="icon" icon={iconButtonIcon} />
        ) : (
            ''
        )
        const iconButtonText = text ? (
            <span key="text" style={{ marginLeft: margin, marginRight: margin }}>
                {text}
            </span>
        ) : null
        if (isTextLeft) {
            return [iconButtonText, ic]
        }
        return [ic, iconButtonText]
    }

    return (
        <CButton
            size={size}
            type={type}
            className={className}
            style={style}
            outline={isOutline}
            disabled={disabled || isLoading}
            onClick={onClick}
            color={color}
        >
            {renderContent()}
        </CButton>
    )
}

IconButton.propTypes = {
    style: PropTypes.object,
    disabled: PropTypes.bool,
    color: PropTypes.string,
    onClick: PropTypes.func,
    icon: PropTypes.object,
    margin: PropTypes.number,
    isOutline: PropTypes.bool,
    text: PropTypes.string,
    isBack: PropTypes.bool,
    isForward: PropTypes.bool,
    isTextLeft: PropTypes.bool,
    size: PropTypes.string,
}
IconButton.defaultProps = {
    style: null,
    disabled: false,
    color: 'primary',
    icon: null,
    isOutline: true,
    margin: 5,
    text: '',
    isBack: false,
    isForward: false,
    isTextLeft: false,
    size: undefined,
}

export default IconButton
