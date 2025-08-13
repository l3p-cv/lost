import { faArrowLeft, faArrowRight, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PropTypes from 'prop-types'
import { CButton, CTooltip } from '@coreui/react'

const CoreIconButton = ({
    isBack = false,
    loadingSize = '1x',
    isLoading = false,
    isForward = false,
    margin = 5,
    icon = null,
    text = "",
    size,
    isTextLeft = false,
    style = null,
    id=undefined,
    type = 'button',
    disabled = false,
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
        const ic = (iconButtonIcon && iconButtonIcon.iconName && iconButtonIcon.prefix)
            ? <FontAwesomeIcon key="icon" icon={iconButtonIcon} size={loadingSize || '2x'} />
            : null
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
                    color={disabled || isLoading ? 'secondary' : color}
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
            color={disabled || isLoading ? 'secondary' : color}
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

export default CoreIconButton
