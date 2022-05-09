import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import PropTypes from 'prop-types'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import IconButton from './IconButton'

const BaseModal = ({
    key,
    isOpen,
    isShowCancelButton,
    toggle,
    title,
    children,
    footer,
    size = 'xl',
    onClosed = () => {},
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
    }
    return (
        <Modal key={key} size={size} isOpen={isOpen} onClosed={onClosed} toggle={toggle}>
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
}

BaseModal.defaultProps = {
    key: undefined,
    size: 'xl',
    onClosed: () => {},
    toggle: undefined,
    title: undefined,
    footer: undefined,
}

export default BaseModal
