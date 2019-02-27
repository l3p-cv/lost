const selectDropdown = (elementId, value) => {
    return {
        type: 'PIPELINE_START_DATASOURCE_SELECT_DROPDOWN',
        payload: {
            elementId, value
        }
    }
}

export default {
    selectDropdown
}