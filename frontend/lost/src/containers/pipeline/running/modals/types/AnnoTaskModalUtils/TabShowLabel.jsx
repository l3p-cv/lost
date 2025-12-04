import { CBadge } from '@coreui/react'
import React from 'react'

const TabShowLabels = ({ labelLeaves }) => {
  return (
    <>
      <div>
        <b>All children of the label tree(s):</b>
      </div>
      <h5>
        <CBadge color="primary" pill>
          {labelLeaves.map((l) => {
            return l.name
          })}
        </CBadge>
      </h5>
    </>
  )
}

export default TabShowLabels
