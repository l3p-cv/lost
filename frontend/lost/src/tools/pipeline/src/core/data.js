import { data } from "l3p-frontend"
import swal from 'sweetalert2'
import appModel from "../apps/start/appModel"
import { API_URL } from "root/settings"


const BASE_URL = `${API_URL}/pipeline`
const URLS = {
    GET_TEMPLATES: `${BASE_URL}/template`,
    GET_TEMPLATE: (id) => `${BASE_URL}/template/${id}`,
    GET_PIPELINES: `${BASE_URL}`,
    GET_PIPELINE: (id) => `${BASE_URL}/${id}`,
    POST_START_PIPELINE: `${BASE_URL}/start`,
    POST_DELETE_PIPELINE: `${BASE_URL}/delete/`,
    POST_PAUSE_PIPELINE: `${BASE_URL}/pause/`,
    POST_PLAY_PIPELINE: `${BASE_URL}/play/`,
}

export function requestTemplates() {
    console.log(URLS.GET_TEMPLATES)
    return data.get(URLS.GET_TEMPLATES, appModel.state.token)
}
export function requestTemplate(id: Number) {
    if (id === undefined || isNaN(id)) {
        throw new Error("invalid id.")
    }
    return data.get(URLS.GET_TEMPLATE(id), appModel.state.token)
}
export function requestPipelines(){
    return data.get(URLS.GET_PIPELINES, appModel.state.token)
}
export function requestPipeline(id: Number){
    if (id === undefined || isNaN(id)) {
        throw new Error("invalid id.")
    }
    return data.get(URLS.GET_PIPELINE(id), appModel.state.token)
}
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
        return data.del(URLS.POST_DELETE_PIPELINE + id, appModel.state.token).then((result) => {
            swal.closeModal();
            if (result === "error") {
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
export function startPipe(pipeJson) {
    return data.post(URLS.POST_START_PIPELINE, pipeJson, appModel.state.token)
}
export function pausePipe(id) {
    return data.post(URLS.POST_PAUSE_PIPELINE, id, appModel.state.token).then((result) => {
        if (result === "error") {
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
export function playPipe(id) {
    return data.post(URLS.POST_PLAY_PIPELINE, id, appModel.state.token).then((result) => {
        if (result === "error") {
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