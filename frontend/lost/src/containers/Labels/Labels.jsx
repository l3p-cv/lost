import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import actions from '../../actions'
import LabelTreeTable from './LabelTreeTable'
import CreateLabelTree from './CreateLabelTree'

const Labels = ({ visLevel }) => {
    const dispatch = useDispatch()
    const labelTrees = useSelector((state) => state.label.trees)
    useEffect(() => {
        dispatch(actions.getLabelTrees(visLevel))
    }, [])
    return (
        <>
            <CreateLabelTree visLevel={visLevel} />
            <LabelTreeTable labelTrees={labelTrees} visLevel={visLevel}></LabelTreeTable>
        </>
    )
}

export default Labels
