import { http } from 'l3p-frontend'
// import { http } from 'root/l3p-frontend'

import { API_URL } from 'root/settings'
// test data for running pipelines.
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
    GET_TEMPLATE: id => `${BASE_URL}/template/${id}`,
    PIPELINE_RUNNING_GET_PIPELINES: `${BASE_URL}`,
    PIPELINE_RUNNING_GET_PIPELINE: id => `${BASE_URL}/${id}`,
    POST_START_PIPELINE: `${BASE_URL}/start`,
    DELETE_PIPELINE: id => `${BASE_URL}/${id}`,
    POST_PAUSE_PIPELINE: id => `${BASE_URL}/pause/${id}`,
	POST_PLAY_PIPELINE: id => `${BASE_URL}/play/${id}`,
	GET_DATA_EXPORT: path => `${API_URL}/${path}`,
	GET_PIPE_LOG: path => `${API_URL}/${path}`
}

// START
export function requestTemplates(token: String){
    return http.get({
		url: URLS.GET_TEMPLATES,
		token,
	})
}
export function requestTemplate(id: Number, token: String){
    return http.get({
		url: URLS.GET_TEMPLATE(id),
		token,
	})
}
export function startPipe(data: any, token: String){
    return http.post({
		url: URLS.POST_START_PIPELINE,
		data,
		token,
		type: "application/json",
	})
}

// RUNNING
export function requestPipelines(){
	const token = localStorage.getItem('token')
	if(DEV){
		return Promise.resolve(DUMMY_DATA.requestPipelines[0])
	}
	return http.get({
		url: URLS.PIPELINE_RUNNING_GET_PIPELINES,
		token,
	})
}
export function requestPipeline(id: Number, token: String){
	if(DEV){
		return Promise.resolve(DUMMY_DATA.requestPipeline[0])
	}
	return http.get({
		url: URLS.PIPELINE_RUNNING_GET_PIPELINE(id),
		token,
	})
}
export function deletePipe(id: Number, token: String){
	return http.del({
		url: URLS.DELETE_PIPELINE(id),
		token,
	})
}

export function pausePipe(id: Number, token: String){
    return http.post({
		url: URLS.POST_PAUSE_PIPELINE(id),
		token,
	})
}

export function playPipe(id: Number, token: String){
    return http.post({
		url: URLS.POST_PLAY_PIPELINE(id),
		token,
	})
}

export function requestDataExport(path: String, token: String){
	return http.get({
		url: URLS.GET_DATA_EXPORT(path),
		token,
		type: 'image'
	})
}

export function requestPipeLogfile(path: String, token: String){
	return http.get({
		url: URLS.GET_PIPE_LOG(path),
		token,
		type: 'image'
	})
}

