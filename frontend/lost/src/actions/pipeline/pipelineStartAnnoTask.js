export const pipelineStartAnnoTask_SelectTab = (tabId) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_SELECT_TAB',
        payload: {
            tabId
        }
    }
}
export const pipelineStartAnnoTask_VerifyTab = (tabId, verified) => {
    return {
        type: 'PIPELINE_START_ANNO_TASK_VERIFY_TAB',
        payload: {
            tabId, verified
        }
    }
}
