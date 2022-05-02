import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import actions from '../../actions'

import BaseContainer from '../../components/BaseContainer'

import Labels from './Labels'

const LabelDashboard = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(actions.setNavbarVisible(true))
    }, [])

    const renderSystemInfo = () => <div>ToDo.</div>

    return (
        <BaseContainer>
            <Labels visLevel="all"></Labels>
        </BaseContainer>
    )
}
export default LabelDashboard
