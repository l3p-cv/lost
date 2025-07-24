import { faArrowLeft, faArrowRight, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PropTypes from 'prop-types'
import { CButton, CTooltip } from '@coreui/react'

const CoreIconButton = ({
    isBack,
    loadingSize = '1x',
    isLoading = false,
    isForward,
    margin,
    icon,
    text,
    size,
    isTextLeft,
    style,
    id=undefined,
    type = 'button',
    disabled,
    onClick,
    className = '',
    color = 'primary',
    isOutline = true,
    toolTip = "",
    tTipPlacement="top",
    shape=""
}) => {
    let iconButtonIcon
    if (isBack) {
        iconButtonIcon = faArrowLeft
    } else if (isForward) {
        iconButtonIcon = faArrowRight
    } else {
        iconButtonIcon = icon
    }

    const buttonVariant = (isOutline ? "outline" : "")

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
            <FontAwesomeIcon key="icon" icon={iconButtonIcon} size={loadingSize || '2x'} />
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

    // Because visible=false does not seem to work...
    if (toolTip != "") {
        return (
            <CTooltip content={toolTip} placement={tTipPlacement}>
                <CButton
                    id={id}
                    size={size}
                    // type={type}
                    className={className}
                    style={style}
                    variant={buttonVariant}
                    disabled={disabled || isLoading}
                    onClick={onClick}
                    color={color}
                    shape={shape}
                >
                    {renderContent()}
                    {/* { props.text && (
                <span style={{marginLeft: 5}}>{props.text}</span>
            )
            } */}
                </CButton>
            </CTooltip>
        )
    }

    return (
        <CButton
            size={size}
            type={type}
            className={className}
            style={style}
            variant={buttonVariant}
            disabled={disabled || isLoading}
            onClick={onClick}
            color={color}
        >
            {renderContent()}
            {/* { props.text && (
                <span style={{marginLeft: 5}}>{props.text}</span>
            )
            } */}
        </CButton>
    )
}

CoreIconButton.propTypes = {
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
CoreIconButton.defaultProps = {
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

export default CoreIconButton
