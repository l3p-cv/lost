import { faInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Button, Tooltip } from 'reactstrap'

const HelpButton = ({ text, id, disabled }) => {
    const [isTootipOpen, setIsToolTipOpen] = useState(false)
    const toggle = () => setIsToolTipOpen(!isTootipOpen)
    if (text) {
        return (
            <>
                <Button
                    id={`tooltip-${id}`}
                    outline
                    style={{
                        paddingRight: 10,
                        paddingLeft: 10,
                        marginLeft: 10,
                        borderRadius: 40,
                    }}
                    disabled={disabled}
                    onMouseEnter={() => setIsToolTipOpen(true)}
                    onMouseLeave={() => {
                        setIsToolTipOpen(false)
                    }}
                    onClick={() => {}}
                    color="primary"
                    type="button"
                >
                    <FontAwesomeIcon
                        size="sm"
                        style={{ display: 'block', margin: '0 auto' }}
                        icon={faInfo}
                    />
                </Button>
                <Tooltip
                    placement="right"
                    isOpen={isTootipOpen}
                    target={`tooltip-${id}`}
                    toggle={toggle}
                >
                    {text}
                </Tooltip>
            </>
        )
    }
    return null
}

HelpButton.propTypes = {
    id: PropTypes.any,
    text: PropTypes.string,
    disabled: PropTypes.bool,
}
HelpButton.defaultProps = {
    id: undefined,
    text: undefined,
    disabled: undefined,
}

export default HelpButton
