import { CContainer } from '@coreui/react'
import React from 'react'

const BaseContainer = (props) => (
    <CContainer
        className={props.className}
        style={{
            background: 'white',
            padding: 15,
            borderRadius: 10,
            border: '1px solid rgba(9, 47, 56, 0.16)',
        }}
    >
        {props.children}
    </CContainer>
)
export default BaseContainer
