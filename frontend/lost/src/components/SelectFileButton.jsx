import PropTypes from 'prop-types'
import { useRef } from 'react'
import { FaUpload } from 'react-icons/fa'
import IconButton from './IconButton2'

const SelectFileButton = ({ text, className, accept, onSelect, disabled = false }) => {
    const inputRef = useRef()
    const selectVideoFaker = () => {
        inputRef.current.click()
    }

    const onFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            onSelect(file)
        }
    }

    return (
        <div>
            <input
                onClick={(event) => {
                    event.target.value = null
                }}
                type="file"
                accept={accept}
                ref={inputRef}
                onInput={onFileChange}
                style={{ display: 'none' }}
            />
            <IconButton
                disabled={disabled}
                left={<FaUpload />}
                right={text}
                className={className}
                onClick={() => {
                    selectVideoFaker()
                }}
            />
        </div>
    )
}

SelectFileButton.propTypes = {
    text: PropTypes.string,
    className: PropTypes.string,
    accept: PropTypes.string,
    onSelect: PropTypes.func,
}

SelectFileButton.defaultProps = {
    text: 'Choose File',
    onSelect: () => {},
}

export default SelectFileButton
