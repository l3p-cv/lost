import PropTypes from 'prop-types'
import { CSSProperties, useRef } from 'react'
import CoreIconButton from './CoreIconButton'
import { faUpload } from '@fortawesome/free-solid-svg-icons'

type SelectFileButtonProps = {
  text?: string
  className?: string
  style?: CSSProperties
  accept?: string
  onSelect?: () => void
  disabled?: boolean
  color?: string
  isOutline?: boolean
}

const SelectFileButton = ({
  text = 'Choose File',
  className,
  style,
  accept,
  onSelect = () => {},
  disabled = false,
  color = 'primary',
  isOutline = true,
}: SelectFileButtonProps) => {
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
        style={style}
        // right={text}
        isOutline={isOutline}
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
