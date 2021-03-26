import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import PropTypes from 'prop-types'

const BaseModal = (props) => {
    const renderTitle = () =>{
        if(props.title) {
            return(
                <ModalHeader toggle={props.toggle} >
                    <p style={{fontSize: 18}}>{props.title}</p>
                </ModalHeader>
            )
        }
        return(null)
    }
    const renderBody = () => {
        if(props.children) {
            return(
                <ModalBody>
                    {props.children}
                </ModalBody>
            )
        }
        return(null)
    }
    const renderFooter = () => {
        if(props.footer) {
            return(
                <ModalFooter>
                    {props.footer}
                </ModalFooter>
            )
        }
        return(null)
    }
    return(
        <Modal
            size= {props.size ? props.size : 'xl'}
            isOpen={props.isOpen}
            onClosed={props.onClosed ? props.onClosed : ()=>{}}
            toggle={props.toggle}>
            {renderTitle()}
            {renderBody()}
            {renderFooter()}
        </Modal>
    )
}

BaseModal.propTypes = {
    size: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    onClosed: PropTypes.func,
    toggle: PropTypes.func,
    title: PropTypes.string,
    children: PropTypes.element.isRequired,
    footer: PropTypes.element
}

export default BaseModal
