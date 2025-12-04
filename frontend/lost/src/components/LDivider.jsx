import React from 'react'

const LDivider = ({
  text,
  orientation = 'center',
  width = '100%',
  className = '',
  textClassName = '',
  ...rest
}) => {
  const getJustifyClass = () => {
    switch (orientation) {
      case 'left':
        return 'justify-content-start'
      case 'right':
        return 'justify-content-end'
      default:
        return 'justify-content-center'
    }
  }

  if (!text) {
    return <hr className={`mx-auto ${className}`} style={{ width }} {...rest} />
  }

  return (
    <div
      className={`d-flex align-items-center ${getJustifyClass()} my-3 ${className}`}
      style={{ width }}
      {...rest}
    >
      <div className="flex-grow-1 border-top"></div>
      <span className={`px-3 ${textClassName}`}>{text}</span>
      <div className="flex-grow-1 border-top"></div>
    </div>
  )
}

export default LDivider
