import axios from 'axios'
import { API_URL } from '../../lost_settings'
import { useMutation } from 'react-query'
import { Point } from 'lost-sia'
import { LegacyAnnotation } from '../../containers/Annotation/SIA/legacyHelper'

type PolygonData = {
    firstPolygon: LegacyAnnotation
    secondPolygon: LegacyAnnotation
}

const usePolygonDifference = () => {
    return useMutation((polygonData: PolygonData) => {
        const requestData = {
            selectedPolygon: polygonData.firstPolygon,
            polygonModifiers: [polygonData.secondPolygon],
        }

        return axios
            .post(API_URL + `/sia/polygonOperations/difference`, requestData)
            .then((res) => res.data)
            .catch((error) => error.response.data)
    })
}

const usePolygonIntersection = () => {
    return useMutation((polygonData: PolygonData) => {
        const requestData = {
            annotations: [polygonData.firstPolygon, polygonData.secondPolygon],
        }

        return axios
            .post(API_URL + `/sia/polygonOperations/intersection`, requestData)
            .then((res) => res.data)
            .catch((error) => error.response.data)
    })
}

const usePolygonUnion = () => {
    return useMutation((polygonData: PolygonData) => {
        const requestData = {
            annotations: [polygonData.firstPolygon, polygonData.secondPolygon],
        }

        return axios
            .post(API_URL + `/sia/polygonOperations/union`, requestData)
            .then((res) => res.data)
            .catch((error) => error.response.data)
    })
}

const useBBoxCreation = () => {
    return useMutation((points: Point[]) => {
        const requestData = {
            data: [points],
        }

        return axios
            .post(API_URL + `/sia/bboxFromPoints`, requestData)
            .then((res) => res.data)
            .catch((error) => error.response.data)
    })
}

export default {
    useBBoxCreation,
    usePolygonDifference,
    usePolygonIntersection,
    usePolygonUnion,
}
