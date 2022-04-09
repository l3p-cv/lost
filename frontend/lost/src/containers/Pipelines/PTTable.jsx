import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import actions from '../../actions'
import IconButton from '../../components/IconButton'

const PTTable = ({ visLevel }) => {
    const dispatch = useDispatch()
    const labelTrees = useSelector((state) => state.label.trees)
    useEffect(() => {
        dispatch(actions.getLabelTrees(visLevel))
    }, [])
    return <IconButton text="Import pipeline template"></IconButton>
}

export default PTTable
