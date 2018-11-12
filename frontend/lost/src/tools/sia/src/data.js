import appModel from "./appModel"
import { http } from "l3p-frontend"

const BACKEND_URL = "/sia/annotation/"
const REQUEST_STRINGS = {
    GET_CONFIG: BACKEND_URL + "configuration",
    GET_CATEGORIES: BACKEND_URL + "label",
    GET_FIRST: BACKEND_URL + "first",
    GET_NEXT_QUERY: (lastImageId) => BACKEND_URL + `next/${lastImageId}`,
    GET_PREV_QUERY: (lastImageId) => BACKEND_URL + `prev/${lastImageId}`,
    POST_FINISH : BACKEND_URL + "finish",
    POST_UPDATE : BACKEND_URL + "update",
    DELETE_ANNO : (imageId) => BACKEND_URL + `junk/${imageId}`,
}

function requestNextUserLockedData(){
    return http.get(REQUEST_STRINGS.GET_NEXT_QUERY(-1))
}


export function sendData(annotationData: any){
    console.log("sending data:", annotationData)
    return http.post(REQUEST_STRINGS.POST_UPDATE, annotationData)
}

export function deleteJunk(imageId: Number){
    return http.del(REQUEST_STRINGS.DELETE_ANNO(imageId))
}
export function requestConfig(){
    return http.get(REQUEST_STRINGS.GET_CONFIG)
    .catch(error => {
        return appModel.config
    })
}
export function requestInitialAnnotation(){
    return http.get(REQUEST_STRINGS.GET_NEXT_QUERY(-1))
}
export function requestFirstData(){
    return http.get(REQUEST_STRINGS.GET_FIRST)
}
export function requestLatestData(){
    return requestNextUserLockedData()
    .then((annoData)=>{
        // if(annohttp.isLastImage){
            return Promise.resolve(annoData)
        // } 
        // else {
        //     return requestPreviousData(annohttp.imgId)
        // }
    })
}
export function requestNextData(imgId: Number) {
    return http.get(REQUEST_STRINGS.GET_NEXT_QUERY(imgId ? imgId : appModel.http.image.id))
}
export function requestPreviousData(imgId: Number) {
    return http.get(REQUEST_STRINGS.GET_PREV_QUERY(imgId ? imgId : appModel.http.image.id))
}
export function requestLabels() {
    return http.get(REQUEST_STRINGS.GET_CATEGORIES)
}
export function requestAnnotationProgress() {
    return http.get("/annotask/api/sia/current")
}


export function finish(){
    return http.post(REQUEST_STRINGS.POST_FINISH)
}
