const nameOnInput = (elementId, value) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_NAME_INPUT',
        payload: {
            elementId, value
        }
    }
}
const instructionsOnInput = (elementId, value) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_INSTRUCTIONS_INPUT',
        payload: {
            elementId, value
        }
    }
}



const selectTab = (tabId, elementId) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_SELECT_TAB',
        payload: {
            tabId, elementId
        }
    }
}






 const verifyTab = (tabId, verified, elementId) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_VERIFY_TAB',
        payload: {
            tabId, verified, elementId
        }
    }
}

export default {
    nameOnInput,
    instructionsOnInput,
    selectTab,
    verifyTab
}