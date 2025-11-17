import {
  faArrowLeft,
  faArrowRight,
  faSync,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CButton, CTooltip } from '@coreui/react'
import { CSSProperties } from 'react'
import { SizeProp } from '@fortawesome/fontawesome-svg-core'

type CoreIconButtonProps = {
  isBack?: boolean
  loadingSize?: SizeProp
  isLoading?: boolean
  isForward?: boolean
  margin?: number
  icon?: IconDefinition
  text?: string
  size?: 'sm' | 'lg' | undefined
  isTextLeft?: boolean
  style?: CSSProperties
  id?: string
  type?: 'button' | 'submit' | 'reset' | undefined
  disabled?: boolean
  onClick?: () => void
  className?: string
  color?: string
  isOutline?: boolean
  toolTip?: string
  tTipPlacement?: 'top' | 'left' | 'right' | 'auto' | 'bottom' | undefined
  shape?: string
}

const CoreIconButton = ({
  isBack = false,
  loadingSize = '1x',
  isLoading = false,
  isForward = false,
  margin = 5,
  icon,
  text = '',
  size,
  isTextLeft = false,
  style = {},
  id = undefined,
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  color = 'primary',
  isOutline = true,
  toolTip = '',
  tTipPlacement = 'top',
  shape = '',
}: CoreIconButtonProps) => {
  let iconButtonIcon: IconDefinition | undefined = icon
  if (isBack) {
    iconButtonIcon = faArrowLeft
  } else if (isForward) {
    iconButtonIcon = faArrowRight
  }

  const buttonVariant: 'ghost' | 'outline' | undefined = isOutline ? 'outline' : undefined

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
    const ic =
      iconButtonIcon && iconButtonIcon.iconName && iconButtonIcon.prefix ? (
        <FontAwesomeIcon key="icon" icon={iconButtonIcon} size={loadingSize || '2x'} />
      ) : null
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
  if (toolTip != '') {
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

export default CoreIconButton
