import TYPES from '../../types'

export const setNavbarVisible = (isVisible) => ({
    type: TYPES.SET_NAVBAR_VISIBLE,
    payload: isVisible,
})

export const setSettings = (obj) => ({
    type: TYPES.SET_SETTINGS,
    payload: obj,
})
