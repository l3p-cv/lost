import React from 'react'

const TagLabel = ({
  label,
  color = '#2185d0',
  size: bodySize = 32,
  triangleSize = 22,
  onClick = null,
  style = {},
  className = '',
}) => {
  // const bodySize = triangleSize*1.414
  // const triangleSize=bodySize*0.7072135785

  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: color,
    color: '#000',
    height: `${bodySize}px`,
    fontSize: `${bodySize * 0.45}px`,
    padding: `0 1rem 0 0.75rem`,
    borderRadius: '0 0.25rem 0.25rem 0',
    marginLeft: `${triangleSize / 1.4}px`, // hypothenuse of the halfed square
    // cursor: 'default',
    position: 'relative',
    overflow: 'visible', // allow triangle to stick out
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  }

  // A rotated square to simulate a triangle
  const triangleStyle = {
    position: 'absolute',
    left: `-${triangleSize / 2}px`,
    width: `${triangleSize}px`,
    height: `${triangleSize}px`,
    backgroundColor: color,
    transform: 'rotate(45deg)',
    zIndex: -1, // push behind text
    pointerEvents: 'none',
  }

  return (
    <span style={containerStyle} className={className} onClick={onClick}>
      <span style={triangleStyle} />
      {label}
    </span>
  )
}

export default TagLabel
