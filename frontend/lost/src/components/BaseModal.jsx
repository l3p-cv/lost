import { faTimes } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import IconButton from './IconButton'

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
                <ModalHeader toggle={toggle}>
                    <p style={{ fontSize: 18 }}>{title}</p>
                </ModalHeader>
            )
        }
        return null
    }
    const renderBody = () => {
        if (children) {
            return <ModalBody>{children}</ModalBody>
        }
        return null
    }
    const renderFooter = () => {
        return (
            isShowCancelButton && (
                <ModalFooter>
                    {[
                        footer || null,
                        isShowCancelButton ? (
                            <IconButton
                                key={key}
                                isOutline={false}
                                color="secondary"
                                icon={faTimes}
                                text="Close"
                                onClick={toggle}
                            ></IconButton>
                        ) : null,
                    ]}
                </ModalFooter>
            )
        )
    }
    return (
        <Modal
            key={key}
            size={size}
            isOpen={isOpen}
            onClosed={onClosed}
            toggle={toggle}
            className={className}
            style={style}
            fullscreen={fullscreen}
        >
            {renderTitle()}
            {renderBody()}
            {renderFooter()}
        </Modal>
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

BaseModal.defaultProps = {
    key: undefined,
    size: 'xl',
    onClosed: () => {},
    toggle: undefined,
    title: undefined,
    footer: undefined,
    className: undefined,
    isShowCancelButton: false,
}

export default BaseModal
