const selectDropdown = (elementId, path, fs_id) => {
    return {
        type: 'PIPELINE_START_DATASOURCE_SELECT_DROPDOWN',
        payload: {
            elementId, path, fs_id
        }
    }
}

const pipeStartUpdateDS = (elementId, value) => {
    return {
        type: 'PIPELINE_START_DATASOURCE_UPDATE',
        payload: {
            elementId, value
        }
    }
}

export default {
    selectDropdown, pipeStartUpdateDS
}