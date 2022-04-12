import React, { useEffect } from 'react'
import PTTable from './PipelineProjectsTable'
import AddPipelineProject from './AddPipelineProject'
import { CRow } from '@coreui/react'

const PipelineProjects = ({ visLevel }) => {
    return (
        <>
            <CRow style={{ marginBottom: 10, marginLeft: 3 }}>
                <AddPipelineProject visLevel={visLevel} />
            </CRow>
            <PTTable visLevel={visLevel}></PTTable>
        </>
    )
}

export default PipelineProjects
