import React from 'react'
import { FaArrowRight, FaArrowLeft, FaSave } from 'react-icons/fa'
import { Button } from 'reactstrap'
import { useTranslation } from 'react-i18next'

const IconButton2 = ({
    onClick,
    color,
    className,
    left,
    right,
    size,
    disabled,
    isForward,
    isBack,
    isSave,
    style,
}) => {
    const { t } = useTranslation()
    let rightComp = right
    let leftComp = left
    if (isForward) {
        leftComp = leftComp || t('general.further')
        rightComp = <FaArrowRight />
    } else if (isBack) {
        leftComp = <FaArrowLeft />
        rightComp = rightComp || t('general.back')
    } else if (isSave) {
        leftComp = <FaSave />
        rightComp = rightComp || t('general.save')
    }

    return (
        <Button
            color={color || 'primary'}
            style={style}
            disabled={disabled}
            size={size}
            className={className}
            outline
            onClick={onClick}
        >
            <div style={{display: 'flex', justifyContent: 'center'}} >
                <div>{leftComp}</div>
                {rightComp && <div style={{marginLeft: 8}} >{rightComp}</div>}
            </div>
        </Button>
    )
}

export default IconButton2
