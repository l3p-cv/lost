import * as transform from './transform'
import * as annoStatus from '../types/annoStatus'
import * as modes from '../types/modes'
import _ from 'lodash'

function _fixBackendAnnoElement(element){
    return {...element, 
        id : element.id ? element.id : _.uniqueId('new'),
        annoTime: element.annoTime ? element.annoTime : 0.0,
        mode: element.mode ? element.mode : modes.VIEW, 
        status: element.status ? element.status : annoStatus.DATABASE,
        labelIds: element.labelIds ? element.labelIds : []
    }
}

export function fixBackendAnnos(backendAnnos){
    let annos =  { 
        bBoxes: [...backendAnnos.bBoxes.map((element) => {
            return _fixBackendAnnoElement(element)
        })],
        lines: [...backendAnnos.lines.map((element) => {
            return _fixBackendAnnoElement(element)
        })],
        polygons: [...backendAnnos.polygons.map((element) => {
            return _fixBackendAnnoElement(element)
        })],
        points: [...backendAnnos.points.map((element) => {
            return _fixBackendAnnoElement(element)
        })],
     }
    console.log('fixBackendAnnos', annos)
    return annos
}

export function backendAnnosToCanvas(backendAnnos, imgSize, imgOffset){
    let annos = [
        ...backendAnnos.bBoxes.map((element) => {
            return {...element, type:'bBox', 
            mode: element.mode ? element.mode : modes.VIEW, 
            status: element.status ? element.status : annoStatus.DATABASE}
        }),
        ...backendAnnos.lines.map((element) => {
            return {...element, type:'line', 
            mode: element.mode ? element.mode : modes.VIEW, 
            status: element.status ? element.status : annoStatus.DATABASE}
        }),
        ...backendAnnos.polygons.map((element) => {
            return {...element, type:'polygon', 
            mode: element.mode ? element.mode : modes.VIEW, 
            status: element.status ? element.status : annoStatus.DATABASE}
        }),
        ...backendAnnos.points.map((element) => {
            return {...element, type:'point', 
            mode: element.mode ? element.mode : modes.VIEW, 
            status: element.status ? element.status : annoStatus.DATABASE
            }
        })
    ]
    annos = annos.map((el) => {
        return {...el, 
            data: transform.toSia(el.data, imgSize, el.type, imgOffset)}
        })
    // this.setState({annos: [...annos]})
    return annos
}

export function canvasToBackendSingleAnno(anno, imgSize, removeFrontedId=false, imgOffset={x:0,y:0}){
        var annoId 
        if (removeFrontedId){
            // If an annotation will be send to backend,
            // ids of new created annoations need to be set to 
            // undefined.
            annoId = (typeof anno.id) === "string" ? undefined : anno.id
        } else {
            annoId = anno.id
        }
        return {
            ...anno,
            id: annoId,
            mode: modes.VIEW,
            data: transform.toBackend(anno.data, imgSize, anno.type, imgOffset)
        }
}

export function canvasToBackendAnnos(annos, imgSize, forBackendPost=false, imgOffset={x:0,y:0}){
    let myAnnos = annos
    const bAnnos = myAnnos.map( el => {
        return canvasToBackendSingleAnno(el, imgSize, forBackendPost, imgOffset)
    })

    const backendFormat = {
            bBoxes: bAnnos.filter((el) => {return el.type === 'bBox'}),
            lines: bAnnos.filter((el) => {return el.type === 'line'}),
            points: bAnnos.filter((el) => {return el.type === 'point'}),
            polygons: bAnnos.filter((el) => {return el.type === 'polygon'}),
    }
    return backendFormat
}