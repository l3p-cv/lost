import appModel from "./appModel"
import { http } from "l3p-frontend"

import { API_URL } from 'root/settings'

const BASE_URL = `${API_URL}/sia/`
const REQUEST_STRINGS = {
    GET_CONFIG: BASE_URL + "configuration",
    GET_CATEGORIES: BASE_URL + "label",
    GET_FIRST: BASE_URL + "first",
    GET_NEXT_QUERY: (lastImageId) => BASE_URL + `next/${lastImageId}`,
    GET_PREV_QUERY: (lastImageId) => BASE_URL + `prev/${lastImageId}`,
    POST_FINISH : BASE_URL + "finish",
    POST_UPDATE : BASE_URL + "update",
    DELETE_ANNO : (imageId) => BASE_URL + `junk/${imageId}`,
}

function requestNextUserLockedData(){
    return http.get(REQUEST_STRINGS.GET_NEXT_QUERY(-1))
}


export function sendData(annotationData: any){
    return http.post(REQUEST_STRINGS.POST_UPDATE, annotationData, appModel.reactComponent.token)
}

export function deleteJunk(imageId: Number){
    return http.del(REQUEST_STRINGS.DELETE_ANNO(imageId), appModel.reactComponent.token)
}
export function requestConfig(){
    return http.get(REQUEST_STRINGS.GET_CONFIG, appModel.reactComponent.token)
}
export function requestInitialAnnotation(){
    return http.get(REQUEST_STRINGS.GET_NEXT_QUERY(-1), appModel.reactComponent.token)
}
export function requestFirstData(){
    return http.get(REQUEST_STRINGS.GET_FIRST, appModel.reactComponent.token)
}
export function requestLatestData(){
    return requestNextUserLockedData().then((annoData) => {
		return Promise.resolve(annoData)
    })
}
export function requestNextData(imgId: Number) {
    return http.get(REQUEST_STRINGS.GET_NEXT_QUERY(imgId ? imgId : appModel.http.image.id), appModel.reactComponent.token)
}
export function requestPreviousData(imgId: Number) {
    return http.get(REQUEST_STRINGS.GET_PREV_QUERY(imgId ? imgId : appModel.http.image.id), appModel.reactComponent.token)
}
export function requestLabels() {
    return http.get(REQUEST_STRINGS.GET_CATEGORIES, appModel.reactComponent.token)
}

// NEEDS ADAPTION TO NEW REACT COMPONENT
export function requestAnnotationProgress() {
    return http.get("http://localhost/api/annotask/working", appModel.reactComponent.token)
}


export function finish(){
    return http.post(REQUEST_STRINGS.POST_FINISH, appModel.reactComponent.token)
}
