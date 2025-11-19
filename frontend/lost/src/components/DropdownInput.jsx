import React, { useEffect, useRef, useState } from 'react'
import {
  CFormInput,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CBadge,
  CCol,
  CCard,
} from '@coreui/react'
export const Wrapper = ({ children }) => {
  return <div className="d-flex align-items-center">{children}</div>
}
const DropdownInput = ({
  placeholder = '',
  options = [],
  inputWidth = 250,
  className,
  style,
  onLabelUpdate = () => {},
  reset,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState(options)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const dropdownMenuRef = useRef(null)
  const [inputSize, setInputSize] = useState({ width: 0, height: 0 })
  const [activeOptions, setActiveOptions] = useState([])

  useEffect(() => {
    if (inputRef.current) {
      setInputSize({
        width: inputRef.current.offsetWidth,
        height: inputRef.current.offsetHeight,
      })
    }
  }, [inputRef])
  useEffect(() => {
    if (options !== undefined) {
      const filtered = options
        .filter((option) =>
          String(option.label).toLowerCase().includes(String(inputValue).toLowerCase()),
        )
        .filter((item) => !activeOptions.includes(item.id))
      setFilteredOptions(filtered)
    }
    onLabelUpdate(activeOptions)
  }, [activeOptions, inputValue])
  useEffect(() => {
    if (reset) {
      setFilteredOptions(options)
      setActiveOptions([])
    }
  }, [reset])
  const handleOptionClick = (option) => {
    setActiveOptions([...activeOptions, option])
    // filterOptions(option)

    setIsOpen(false)
  }

  const removeActiveOption = (option) => {
    setActiveOptions(activeOptions.filter((item) => item !== option))
    // filterOptions()
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        !Array.from(event.target.classList).includes('dropdown-item') &&
        !dropdownMenuRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [inputRef])

  return (
    <>
      <CCard
        style={{ ...style, padding: 5, width: inputWidth + 12 }}
        className={className}
      >
        <CCol style={{ width: inputWidth }}>
          {activeOptions.map((item) => (
            <CBadge
              className="mt-1 me-1"
              style={{ cursor: 'default' }}
              onClick={() => removeActiveOption(item)}
              color="secondary"
            >
              {options.find((el) => el.id === item).label}
              <span style={{ fontSize: '1.5em' }}> &times;</span>
            </CBadge>
          ))}
          <CDropdown ref={dropdownRef} placement="bottom-start">
            <CFormInput
              className={activeOptions.length > 0 ? 'mt-1' : ''}
              style={{ minWidth: inputWidth }}
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onClick={() => setIsOpen(!isOpen)}
              placeholder={placeholder}
            />
            <CDropdownMenu
              ref={dropdownMenuRef}
              style={{
                maxHeight: 200,
                overflowY: 'auto',
                marginTop: inputSize.height,
                width: inputSize.width,
              }}
              className={isOpen ? 'show' : ''}
            >
              {filteredOptions.map((option, index) => (
                <CDropdownItem key={index} onClick={() => handleOptionClick(option.id)}>
                  {option.label}
                </CDropdownItem>
              ))}
            </CDropdownMenu>
          </CDropdown>
        </CCol>
      </CCard>
    </>
  )
}

export default DropdownInput
