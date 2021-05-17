import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {Button} from 'reactstrap'

const IconButton = (props) => {
    return(
        <Button
            style={props.style}
            outline
            disabled={props.disabled}
            onClick={props.onClick}
            color= {props.color}
        >
            <FontAwesomeIcon icon={props.icon} />
            { props.text && (
                <span style={{marginLeft: 5}}>{props.text}</span>
            )
            }
        </Button>
    )
}

IconButton.propTypes = {
    style: PropTypes.object,
    disabled: PropTypes.bool,
    color: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.object.isRequired,
    text: PropTypes.string
}

export default IconButton
