import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {Button} from 'reactstrap'

const IconButton = (props) => {
    return(
        <Button
            outline
            disabled={props.disabled}
            onClick={props.onClick}
            color= {props.color}
            size= {props.size}
        >
            <FontAwesomeIcon icon={props.icon} />
            <span style={{marginLeft: 5}}>{props.text}</span>
        </Button>
    )
}

IconButton.propTypes = {
    size: PropTypes.string,
    disabled: PropTypes.bool,
    color: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.object.isRequired,
    text: PropTypes.string.isRequired
}

export default IconButton
