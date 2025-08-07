import PropTypes from 'prop-types'
import { useRef } from 'react'
import CoreIconButton from './CoreIconButton'
import { faUpload } from '@fortawesome/free-solid-svg-icons'

const SelectFileButton = ({ text='Choose File', className, accept, onSelect=() => {}, disabled=false, color="primary" }) => {
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
            <CoreIconButton
                disabled={disabled}
                // left={<FaUpload />}
                icon={faUpload}
                // right={text}
                text={text}
                className={className}
                onClick={() => {
                    selectVideoFaker()
                }}
                color={color}
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

export default SelectFileButton
