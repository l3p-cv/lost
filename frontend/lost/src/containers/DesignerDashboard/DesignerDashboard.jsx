import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import actions from '../../actions'

import BaseContainer from '../../components/BaseContainer'

const DesignerDashboard = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(actions.setNavbarVisible(true))
    }, [])



    return (
        <BaseContainer>
            ToDo.
        </BaseContainer>
    )
}
export default DesignerDashboard
