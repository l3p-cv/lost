import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import actions from '../../actions'
import LabelTreeTable from './LabelTreeTable'
import CreateLabelTree from './CreateLabelTree'
import { CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react'

const Labels = ({ visLevel }) => {
    const dispatch = useDispatch()
    const labelTrees = useSelector((state) => state.label.trees)
    useEffect(() => {
        dispatch(actions.getLabelTrees(visLevel))
    }, [])

    return (
        <CContainer>
            <CCard className='mt-3'>
                <CCardHeader>
                    <h4>Create Label Tree</h4>
                </CCardHeader>
                <CCardBody>
                    <CreateLabelTree visLevel={visLevel} />
                </CCardBody>
            </CCard>

            <CCard className='mt-3'>
                <CCardHeader>
                    <h4>Label Trees</h4></CCardHeader>
                <CCardBody>
                    <LabelTreeTable labelTrees={labelTrees} visLevel={visLevel}></LabelTreeTable>
                </CCardBody>
            </CCard>
        </CContainer>
    )
}

export default Labels
