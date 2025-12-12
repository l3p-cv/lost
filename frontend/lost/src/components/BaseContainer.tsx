import { CContainer } from '@coreui/react'
import React from 'react'
import { CSSProperties } from 'react'

type BaseContainerProps = {
  style?: CSSProperties
  className?: string
  children?: any
}

const BaseContainer = ({ className = '', style, children }: BaseContainerProps) => {
  const baseStyle = {
    background: 'white',
    padding: 15,
    borderRadius: 10,
    border: '1px solid rgba(9, 47, 56, 0.16)',
  }

  return (
    <CContainer
      className={className}
      style={{ ...baseStyle, ...style }} // incoming style overrides defaults
    >
      {children}
    </CContainer>
  )
}

export default BaseContainer
