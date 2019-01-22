import appModel from "./appModel"
// import { http } from "l3p-frontend"
import { http } from "root/l3p-frontend"

import { API_URL } from 'root/settings'

const BASE_URL = `${API_URL}/sia`
const REQUEST_STRINGS = {
    GET_CONFIG: `${BASE_URL}/configuration`,
    GET_CATEGORIES: `${BASE_URL}/label`,
    GET_FIRST: `${BASE_URL}/first`,
    GET_NEXT_QUERY: lastImageId => `${BASE_URL}/next/${lastImageId}`,
    GET_PREV_QUERY: lastImageId => `${BASE_URL}/prev/${lastImageId}`,
    POST_FINISH : `${BASE_URL}/finish`,
    POST_UPDATE : `${BASE_URL}/update`,
    DELETE_ANNO : imageId => `${BASE_URL}/junk/${imageId}`,
	PROGRESS: `${API_URL}/annotask/working`,
}
function requestNextUserLockedData(){
    return http.get({
		url: REQUEST_STRINGS.GET_NEXT_QUERY(-1),
		token: appModel.reactComponent.token,
	})
}

export function sendData(annotationData: any){
    return http.post({
		url: REQUEST_STRINGS.POST_UPDATE, 
		data: annotationData,
		token: appModel.reactComponent.token,
		// type: "application/json",
	})
}
export function deleteJunk(imageId: Number){
    return http.del({
		url: REQUEST_STRINGS.DELETE_ANNO(imageId),
		token: appModel.reactComponent.token,
	})
}
export function requestConfig(){
    return http.get({
		url: REQUEST_STRINGS.GET_CONFIG,
		token: appModel.reactComponent.token,
	})
}
export function requestInitialAnnotation(){
    return http.get({
		url: REQUEST_STRINGS.GET_NEXT_QUERY(-1),
		token: appModel.reactComponent.token,
	})
}
export function requestFirstData(){
    return http.get({
		url: REQUEST_STRINGS.GET_FIRST,
		token: appModel.reactComponent.token,
	})
}
export function requestLatestData(){
    return requestNextUserLockedData().then((annoData) => {
		return Promise.resolve(annoData)
    })
}
export function requestNextData(imgId: Number){
    return http.get({
		url: REQUEST_STRINGS.GET_NEXT_QUERY(imgId ? imgId : appModel.data.image.id),
		token: appModel.reactComponent.token,
	})
}
export function requestPreviousData(imgId: Number) {
    return http.get({
		url: REQUEST_STRINGS.GET_PREV_QUERY(imgId ? imgId : appModel.data.image.id),
		token: appModel.reactComponent.token,
	})
}
export function requestLabels(){
    return http.get({
		url: REQUEST_STRINGS.GET_CATEGORIES,
		token: appModel.reactComponent.token,
	})
}
export function requestImage(url: String){
	return http.get({
		url,
		token: appModel.reactComponent.token,
		type: "image",
	})
}
// needs adaption to new react component
export function requestAnnotationProgress() {
    return http.get({
		url: REQUEST_STRINGS.PROGRESS,
		token: appModel.reactComponent.token
	})
}
export function finish(){
    return http.get({
		url: REQUEST_STRINGS.POST_FINISH,
		token: appModel.reactComponent.token,
	})
}
