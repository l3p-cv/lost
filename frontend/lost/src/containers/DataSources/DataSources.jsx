import React from 'react'
import DSTable from './DSTable'
import { CContainer } from '@coreui/react'

const DataSources = () => (
  <CContainer style={{ marginTop: '15px' }}>
    {/* <h3 className="card-title mb-3" style={{ textAlign: 'center' }}>
            Datasources
        </h3> */}
    <DSTable visLevel="all"></DSTable>
  </CContainer>
)

export default DataSources
