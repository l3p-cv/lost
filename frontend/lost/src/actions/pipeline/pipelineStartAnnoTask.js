 const selectTab = (tabId) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_SELECT_TAB',
        payload: {
            tabId
        }
    }
}
 const verifyTab = (tabId, verified) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_VERIFY_TAB',
        payload: {
            tabId, verified
        }
    }
}


export default {selectTab, verifyTab}