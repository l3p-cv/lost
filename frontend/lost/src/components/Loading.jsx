import React from 'react'
// import { FaSync } from 'react-icons/fa'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'

const Loading = ({ size, marginTop }) => (
    <div className="flex justify-center items-center h-full" style={{ marginTop }}>
        {/* <FaSync className="animate-spin" size={size} /> */}
        <FontAwesomeIcon color="#092F38" size={size} icon={faSync} spin />
    </div>
)

Loading.propTypes = {
    size: PropTypes.number,
    marginTop: PropTypes.number,
}

Loading.defaultProps = {
    size: 40,
    marginTop: 20,
}

export default Loading
