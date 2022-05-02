import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from 'reactstrap'
import { faArrowLeft, faArrowRight, faSync } from '@fortawesome/free-solid-svg-icons'

const IconButton = ({
    isBack,
    loadingSize,
    isLoading,
    isForward,
    margin,
    icon,
    text,
    size,
    isTextLeft,
    style,
    type,
    disabled,
    onClick,
    className,
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
        <Button
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
            {/* { props.text && (
                <span style={{marginLeft: 5}}>{props.text}</span>
            )
            } */}
        </Button>
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
