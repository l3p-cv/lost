const updateArguments = (elementId, value) => {
    return {
        type: 'PIPELINE_START_SCRIPT_UPDATE_ARGUMENTS',
        payload: {
            elementId, value
        }
    }
}

export default {
    updateArguments
}