const nameOnInput = (elementId, value) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_NAME_INPUT',
        payload: {
            elementId,
            value,
        },
    }
}
const instructionsOnInput = (elementId, value) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_INSTRUCTIONS_INPUT',
        payload: {
            elementId,
            value,
        },
    }
}

const selectUser = (elementId, assignee, workerId) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_SELECT_USER',
        payload: {
            elementId,
            assignee,
            workerId,
        },
    }
}

const selectLabelTree = (elementId, value) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_SELECT_TREE',
        payload: {
            elementId,
            value,
        },
    }
}

const updateLabels = (elementId, lableArr) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_UPDATE_LABELS',
        payload: {
            elementId,
            lableArr,
        },
    }
}

const selectTab = (elementId, tabId) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_SELECT_TAB',
        payload: {
            tabId,
            elementId,
        },
    }
}

const updateConfiguration = (elementId, configuration) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_UPDATE_CONFIGURATION',
        payload: {
            elementId,
            configuration,
        },
    }
}

const verifyTab = (elementId, tabId, verified) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_VERIFY_TAB',
        payload: {
            tabId,
            verified,
            elementId,
        },
    }
}

export default {
    nameOnInput,
    instructionsOnInput,
    selectTab,
    verifyTab,
    updateLabels,
    selectUser,
    selectLabelTree,
    updateConfiguration,
}
