import {API_URL} from '../../settings'
import axios from 'axios'

export const startPipeSelectTab = (tabId) => {
    return {
        type: 'START_PIPE_SELECT_TAB',
        payload: {
            tabId
        }
    }
}


export const startPipeVerifyTab = (tabId, verified) => {
    return {
        type: 'START_PIPE_VERIFY_TAB',
        payload: {
            tabId, verified
        }
    }
}
