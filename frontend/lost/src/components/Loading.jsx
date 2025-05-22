import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/free-solid-svg-icons'

const Loading = ({ size='40', marginTop='20' }) => (
    <div className="flex justify-center items-center h-full" style={{ marginTop }}>
        <FontAwesomeIcon color="#092F38" size={size} icon={faSync} spin />
    </div>
)

export default Loading
