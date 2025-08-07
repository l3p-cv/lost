import { faInfo } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import CoreIconButton from './CoreIconButton'

const HelpButton = ({ text, id, disabled }) => {
    if (text) {
        return (
                <CoreIconButton
                    placement="right"
                    shape='rounded-circle'
                    tTipPlacement='right'
                    toolTip={text}
                    icon={faInfo}
                    id={id}
                    disabled={disabled}
                    size="sm"
                    loadingSize='1x'
                    style={{
                        borderRadius: "50%", //not needed???
                        width: "23px",
                        height: "23px",
                        padding: 0, // to keep text/icon centered
                    }}
                >
                </CoreIconButton>
        )
    }
    return null
}

HelpButton.propTypes = {
    id: PropTypes.any,
    text: PropTypes.string,
    disabled: PropTypes.bool,
}

export default HelpButton
