import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import actions from '../../actions'
import PTTable from './PTTable'
import AddPipelineTemplate from './AddPipelineTemplate'
import { CRow } from '@coreui/react'

const PipelineTemplates = ({ visLevel }) => {
    const dispatch = useDispatch()
    const labelTrees = useSelector((state) => state.label.trees)
    useEffect(() => {
        dispatch(actions.getLabelTrees(visLevel))
    }, [])
    return (
        <>
            <CRow>
                <AddPipelineTemplate visLevel={visLevel} />
            </CRow>
            <CRow>
                <PTTable labelTrees={labelTrees} visLevel={visLevel}></PTTable>
            </CRow>
        </>
    )
}

export default PipelineTemplates
