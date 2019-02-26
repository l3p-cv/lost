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

const selectUser = (elementId, assignee, workerId) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_SELECT_USER',
        payload: {
            elementId, assignee, workerId
        }
    }
}

const selectLabelTree = (elementId, value) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_SELECT_TREE',
        payload: {
            elementId, value
        }
    }
}


const selectTab = (elementId, tabId ) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_SELECT_TAB',
        payload: {
            tabId, elementId
        }
    }
}






 const verifyTab = (elementId, tabId, verified ) => {
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
    verifyTab,
    selectUser,
    selectLabelTree
}