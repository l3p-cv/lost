import { http } from 'l3p-frontend'
import swal from 'sweetalert2'
import { API_URL } from 'root/settings'

const DEV = false
const DUMMY_DATA = {
	requestPipelines: [
		{
			id: 0,
			name: 'dummy pipeline',
			description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut',
			creatorName: 'cartok',
			progress: 0,
			date: 'December 17, 2018 03:25:00',
			isDebug: false,
			logfilePath: '',
			templateName: 'dummy template',
			pipes: [{
				elements: [
					{
						"peN": 0,
						"peOut": [1],
						"datasource": {
							"type": "rawFile"
						},
					},
					{
						"peN": 1,
						"peOut": [2],
						"script": {
							"path": "request_annos.py",
							"description": "Request annotations for all images.",
						},
					},
					{
						"peN": 2,
						"peOut": [3,5],
						"annoTask": {
							"name": "Single Image Annoations",
							"type": "sia",
							"instructions": "Please draw annotations for all objects in the image",
							"configuration": {
								"tools": {
									"point": true,
									"line": true,
									"polygon": true,
									"bbox": true,
								},
								"actions": {
									"drawing": true,
									"labeling": true,
									"edit": {
										"label": true,
										"bounds": true,
										"delete": true,
									},
								},
								"drawables": {
									"bbox": {
										"minArea": 9,
										"minAreaType": "abs",
									},
								},
							},
						},
					},
					{
						"peN": 3,
						"peOut": [4],
						"script": {
							"path": "export_annos.py",
							"description": "Export annotations to csv file.",
							"arguments": {
								"file_name": {
									"value": "export.csv",
									"help": "Name of the file to export",
								},
							},
						},
					},
					{
						"peN": 4,
						"peOut": [7],
						"dataExport": {}
					},
					{
					"peN" : 5,
						"peOut" : [6],
						"script" : {
							"path": "vis_arguments.py",
							"description" : "Write the out argument to a visual output.",
						},
					},
					{
						"peN" : 6,
						"peOut" : [7],
						"visualOutput" : {
							"type" : "html",
						},
					},
					{
						"peN" : 7,
						"peOut" : null,
						"loop" : {
							"max_iteration" : 3,
							"peJumpId" : 0,
						},
					},
				]
			}]
		},
	],
	requestPipeline: [
		{
			id: 0,

		}
	]
}

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

export function requestTemplates(token) {
    return http.get(URLS.GET_TEMPLATES, token)
}
export function requestTemplate(id: Number, token) {
    if (id === undefined || isNaN(id)) {
        throw new Error('invalid id.')
    }
    return http.get(URLS.GET_TEMPLATE(id), token)
}
export function requestPipelines(token){
	if(DEV){
		return Promise.resolve(DUMMY_DATA.requestPipelines[0])
	} else {
	    return http.get(URLS.GET_PIPELINES, token)
	}
}
export function requestPipeline(id: Number, token){
	if(DEV){
		return Promise.resolve(DUMMY_DATA.requestPipeline[0])
	} else {
		if (id === undefined || isNaN(id)) {
			throw new Error('invalid id.')
		}
		return http.get(URLS.GET_PIPELINE(id), token)
	}
}
// remove swal
export function deletePipe(id, token) {
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
        return http.del(URLS.POST_DELETE_PIPELINE + id, token).then((result) => {
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

export function startPipe(data, token) {
    return http.post(URLS.POST_START_PIPELINE, data, token)
}


export function pausePipe(id, token) {
    return http.post(URLS.POST_PAUSE_PIPELINE, id, token).then((result) => {
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
