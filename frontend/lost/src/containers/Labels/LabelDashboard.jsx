import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import actions from '../../actions'
import Labels from './Labels'

const LabelDashboard = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(actions.setNavbarVisible(true))
    }, [])

    return <Labels visLevel="all"></Labels>
}
export default LabelDashboard
