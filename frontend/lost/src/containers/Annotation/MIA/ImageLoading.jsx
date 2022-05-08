import React from 'react'
// import { FaSync } from 'react-icons/fa'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'

const Loading = ({ size }) => (
    <div
        className="flex justify-center items-center h-full"
        style={{ margin: '10px', display: 'inline' }}
    >
        {/* <FaSync className="animate-spin" size={size} /> */}
        <FontAwesomeIcon color="#092F38" size={size} icon={faSync} spin />
    </div>
)

Loading.propTypes = {
    size: PropTypes.string,
    marginTop: PropTypes.number,
}

Loading.defaultProps = {
    size: 'lg',
    marginTop: 20,
}

export default Loading
