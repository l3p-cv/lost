import { http } from 'l3p-frontend'
import swal from 'sweetalert2'
import appModel from './apps/start/appModel'
import { API_URL } from 'root/settings'


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
    return http.get(URLS.GET_TEMPLATES, appModel.state.token)
}
export function requestTemplate(id: Number) {
    if (id === undefined || isNaN(id)) {
        throw new Error('invalid id.')
    }
    return http.get(URLS.GET_TEMPLATE(id), appModel.state.token)
}
export function requestPipelines(){
    return http.get(URLS.GET_PIPELINES, appModel.state.token)
}
export function requestPipeline(id: Number){
    if (id === undefined || isNaN(id)) {
        throw new Error('invalid id.')
    }
    return http.get(URLS.GET_PIPELINE(id), appModel.state.token)
}
// remove swal
export function deletePipe(id) {
    return swal({
        title: 'Are you sure to delete this pipe? ',
        text: 'You will not be able to revert this!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
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
        return http.del(URLS.POST_DELETE_PIPELINE + id, appModel.state.token).then((result) => {
            swal.closeModal()
            if (result === 'error') {
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
            return 'cancel'
        }
    })
}

// NO CREDENTIALS
function post(url, data, token) {
    const request = new Request(url, {
        method: "POST",
        // credentials: "include",
        headers: new Headers({
            "Content-Type" : "application/json",
            "Authorization": `Bearer ${token}`,
        }),
        body: JSON.stringify(data ? data : {}),
    })
    console.log(`POST: ${url}`)
    console.dir(data)
    return fetch(request).then((response) => handleJsonResponse(response))
}
function handleJsonResponse(response){
    if(response.ok){
        return response.json()
    } else {
        throw new Error(`Network response was not ok. Response status: ${response.status}: ${response.statusText}.`)
    }
}
export function startPipe(data) {
    return http.post(URLS.POST_START_PIPELINE, data, appModel.state.token)
}


export function pausePipe(id) {
    return http.post(URLS.POST_PAUSE_PIPELINE, id, appModel.state.token).then((result) => {
        if (result === 'error') {
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
    return http.post(URLS.POST_PLAY_PIPELINE, id, appModel.state.token).then((result) => {
        if (result === 'error') {
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