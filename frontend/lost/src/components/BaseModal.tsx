import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { CCloseButton, CModal, CModalBody, CModalFooter, CModalHeader } from '@coreui/react'
import CoreIconButton from './CoreIconButton'

type BaseModalProps = {
  id?: string
  isOpen: boolean
  toggle?: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode | null
  size?: 'sm' | 'lg' | 'xl'
  onClosed?: () => void
  className?: string
  isShowCancelButton?: boolean
  backdropOption?: boolean | 'static'
  style?: React.CSSProperties
  fullscreen?: boolean
  asForm?: boolean
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  onShow?: () => void
  onClosePrevented?: () => void
  showCloseButton?: boolean
}

const BaseModal: React.FC<BaseModalProps> = ({
  id,
  isOpen = false,
  isShowCancelButton = false,
  toggle = () => {},
  title,
  children,
  footer = null,
  size = 'xl',
  onClosed = () => {},
  className,
  backdropOption = true,
  style = {},
  fullscreen = false,
  asForm = false,
  onSubmit = () => {},
  onShow = () => {},
  onClosePrevented = () => {},
  showCloseButton = true,
}) => {
  const Wrapper = asForm ? 'form' : 'div'
  const renderTitle = () => {
    if (title) {
      return (
        <CModalHeader
          closeButton={showCloseButton}
          onClick={() => {
            if (isOpen) {
              toggle()
              onClosed()
            }
          }}
        >
          <p style={{ fontSize: 18 }}>{title}</p>
          {!showCloseButton && (
            <CCloseButton onClick={() => { toggle(); onClosed() }} />
          )}
        </CModalHeader>
      )
    }
    return null
  }
  const renderBody = () => {
    if (children) {
      return <CModalBody style={style}>{children}</CModalBody>
    }
    return null
  }
  const renderFooter = () => {
    return (
      (footer || isShowCancelButton) && (
        <CModalFooter>
          {[
            footer || null,
            isShowCancelButton ? (
              <CoreIconButton
                id={id}
                color="secondary"
                icon={faTimes}
                text="Close"
                onClick={toggle}
              />
            ) : null,
          ]}
        </CModalFooter>
      )
    )
  }
  return (
    <CModal
      onShow={onShow}
      id={id}
      size={size}
      visible={isOpen}
      backdrop={backdropOption}
      fullscreen={fullscreen}
      onClosePrevented={onClosePrevented}
      onClose={() => {
        if (isOpen) {
          toggle()
          onClosed()
        }
      }}
    >
      <Wrapper onSubmit={asForm ? onSubmit : () => {}} className={className}>
        {renderTitle()}
        {renderBody()}
        {renderFooter()}
      </Wrapper>
    </CModal>
  )
}

export default BaseModal
