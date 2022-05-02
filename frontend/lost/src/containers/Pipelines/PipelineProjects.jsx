import React from 'react'
import PTTable from './PipelineProjectsTable'

const PipelineProjects = ({ visLevel }) => {
    return (
        <>
            <PTTable visLevel={visLevel}></PTTable>
        </>
    )
}

export default PipelineProjects
