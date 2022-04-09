import React, { useEffect } from 'react'
import PTTable from './PTTable'
import AddPipelineTemplate from './AddPipelineTemplate'
import { CRow } from '@coreui/react'

const PipelineTemplates = ({ visLevel }) => {
    return (
        <>
            <CRow style={{ marginBottom: 10, marginLeft: 3 }}>
                <AddPipelineTemplate visLevel={visLevel} />
            </CRow>
            <PTTable visLevel={visLevel}></PTTable>
        </>
    )
}

export default PipelineTemplates
