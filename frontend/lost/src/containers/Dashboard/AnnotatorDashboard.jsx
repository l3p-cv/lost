import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import actions from '../../actions'

import BaseContainer from '../../components/BaseContainer'
import PersonalStatistics from '../Statistics/PersonalStatistics'

const AnnotatorDashboard = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(actions.setNavbarVisible(true))
    }, [])

    return (
        <BaseContainer>
            <PersonalStatistics />
        </BaseContainer>
    )
}
export default AnnotatorDashboard
