import { faTimes } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import IconButton from './IconButton'
import { CModal, CModalBody, CModalFooter, CModalHeader } from '@coreui/react'
import CoreIconButton from './CoreIconButton'

const BaseModal = ({
  key,
  isOpen,
  isShowCancelButton = false,
  toggle,
  title,
  children,
  footer,
  size = 'xl',
  onClosed = () => {},
  className,
  style = undefined,
  fullscreen = false,
}) => {
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
      return <CModalBody>{children}</CModalBody>
    }
    return null
  }
  const renderFooter = () => {
    return (
      // isShowCancelButton && (
      <CModalFooter>
        {[
          footer || null,
          isShowCancelButton ? (
            <CoreIconButton
              key={key}
              // isOutline={false}
              color="primary"
              icon={faTimes}
              text="Close"
              onClick={toggle}
            />
          ) : null,
        ]}
      </CModalFooter>
    )
    // )
  }
  return (
    // TODO: fix this as CModal... does not want to work...
    // <Modal
    //     key={key}
    //     size={size}
    //     isOpen={isOpen}
    //     onClosed={onClosed}
    //     toggle={toggle}
    //     className={className}
    //     style={style}
    //     fullscreen={fullscreen}
    // >
    //     {renderTitle()}
    //     {renderBody()}
    //     {renderFooter()}
    // </Modal>

    <CModal
      key={key}
      size={size}
      visible={isOpen}
      // onClose={toggle}
      onClose={() => {
        if (isOpen) {
          toggle()
          onClosed()
        }
      }}
      // className={className}
      // style={style}
      // fullscreen={fullscreen}
    >
      <div className={className}>
        {renderTitle()}
        {renderBody()}
        {renderFooter()}
      </div>
    </CModal>
  )
}

BaseModal.propTypes = {
  key: PropTypes.string,
  size: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClosed: PropTypes.func,
  toggle: PropTypes.func,
  title: PropTypes.string,
  children: PropTypes.element.isRequired,
  footer: PropTypes.element,
  className: PropTypes.string,
  isShowCancelButton: PropTypes.bool,
}

export default BaseModal
