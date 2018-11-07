import { data } from "l3p-core"
// import * as data from "../../../../../l3p-frontend-core/src/lib/data/data"
import swal from 'sweetalert2'
const BASE_URL = "/pipeline/api"
const URLS = {
    // GET_TEMPLATE: (id) => `${BASE_URL}/template/${id}`,
    GET_TEMPLATE: `${BASE_URL}/template/`,
    // GET_TEMPLATES_NORMAL: `${BASE_URL}/templates`,
    GET_TEMPLATES_NORMAL: `${BASE_URL}/templates/debug=false`,
    GET_TEMPLATES_DEBUG: `${BASE_URL}/templates/debug=true`,

    // GET: /pipeline/api/running-pipes/debug=[boolean]
    GET_RUNNING_PIPES_NORMAL: `${BASE_URL}/running-pipes/debug=false`,
    GET_RUNNING_PIPES_DEBUG: `${BASE_URL}/running-pipes/debug=true`,
    // GET: /pipeline/api/running-pipe/\[id\]
    GET_RUNNING_PIPE: `${BASE_URL}/running-pipe/`,

    // GET:/pipeline/api/completed-pipes/debug=[boolean]
    GET_COMPLETED_PIPES_NORMAL: `${BASE_URL}/completed-pipes/debug=false`,
    GET_COMPLETED_PIPES_DEBUG: `${BASE_URL}/completed-pipes/debug=true`,
    // GET: /pipeline/api/completed-pipe/[id]
    GET_COMPLETED_PIPE: `${BASE_URL}/completed-pipe/`,

    GET_PIPELINE_CREATE: `${BASE_URL}/pipeline-template-creation-data`,
    POST_START_PIPELINE: `${BASE_URL}/start`,
    POST_DELETE_PIPELINE: `${BASE_URL}/delete/`,
    POST_PAUSE_PIPELINE: `${BASE_URL}/pause/`,
    POST_PLAY_PIPELINE: `${BASE_URL}/play/`,
}

// START PIPE
// ONE
export function requestTemplate(id: number) {
    if (id === undefined || isNaN(id)) {
        throw new Error("invalid id.")
    }
    return data.get(URLS.GET_TEMPLATE + id)
}
// ALL
export function requestTemplates(isDebug) {
    return (isDebug === true) ?
        data.get(URLS.GET_TEMPLATES_DEBUG) :
        data.get(URLS.GET_TEMPLATES_NORMAL)
}
// RUNNING PIPE
// ONE
export function requestRunningPipe(id: number) {
    if (id === undefined || isNaN(id)) {
        throw new Error("invalid id.")
    }
    return data.get(URLS.GET_RUNNING_PIPE + id)
}
// ALL
export function requestRunningPipes(debug) {
    return (debug === true) ?
        data.get(URLS.GET_RUNNING_PIPES_DEBUG) :
        data.get(URLS.GET_RUNNING_PIPES_NORMAL)
}
// COMPLETED PIPE
//ALL
export function requestCompletedPipes(debug) {
    return (debug === true) ?
        data.get(URLS.GET_COMPLETED_PIPES_DEBUG) :
        data.get(URLS.GET_COMPLETED_PIPES_NORMAL)
}
// ONE
export function requestCompletedPipe(id: number) {
    if (id === undefined || isNaN(id)) {
        throw new Error("invalid id.")
    }
    return data.get(URLS.GET_COMPLETED_PIPE + id)
}


// DELETE PIPE RUNNING, COMPLETED
export function deletePipe(id) {
    return swal({
        title: 'Are you sure to delete this pipe? ',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, do it!',
        cancelButtonText: 'No, cancel!',
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger',
        buttonsStyling: false
    }).then(function () {
        swal({
            title: 'Delete Pipeline!',
            onOpen: () => {
                swal.showLoading()
            }
        })
        return data.del(URLS.POST_DELETE_PIPELINE + id).then((result) => {
            swal.closeModal();
            if (result == "error") {
                swal({
                    type: 'error',
                    title: 'Oops...',
                    text: 'Delete Pipeline failed. Please contact admin.',
                })
                return false
            } else {

                return true
            }
        })
    }, function (dismiss) {
        // dismiss can be 'cancel', 'overlay',
        // 'close', and 'timer'
        if (dismiss === 'cancel') {
            return "cancel"
        }
    })
}

// POST JSON START PIPE FROM PIPE START
export function startPipe(pipeJson) {
    return data.post(URLS.POST_START_PIPELINE, pipeJson)
}

// PAUSE PIPE  Return in Promiss if isSucess
export function pausePipe(id) {
    return data.post(URLS.POST_PAUSE_PIPELINE, id).then((result) => {
        if (result == "error") {
            swal({
                type: 'error',
                title: 'Oops...',
                text: 'Pause Pipeline failed. Please contact admin.',
            })
            return false
        } else {
            return true
        }
    })
}

// PLAY PIPE, Return in Promiss if isSucess
export function playPipe(id) {
    return data.post(URLS.POST_PLAY_PIPELINE, id).then((result) => {
        if (result == "error") {
            swal({
                type: 'error',
                title: 'Oops...',
                text: 'Play Pipeline failed. Please contact admin.',
            })
            return false
        } else {
            return true
        }
    })
}