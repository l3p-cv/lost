import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { CModal, CModalBody, CModalFooter, CModalHeader } from '@coreui/react'
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
}) => {
  const Wrapper = asForm ? 'form' : 'div'
  const renderTitle = () => {
    if (title) {
      return (
        <CModalHeader
          onClick={() => {
            if (isOpen) {
              toggle()
              onClosed()
            }
          }}
        >
          <p style={{ fontSize: 18 }}>{title}</p>
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
      id={id}
      size={size}
      visible={isOpen}
      backdrop={backdropOption}
      fullscreen={fullscreen}
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
