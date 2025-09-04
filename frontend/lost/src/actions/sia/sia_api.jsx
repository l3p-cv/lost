import axios from 'axios'
import { useQuery } from 'react-query'
import { API_URL } from '../../lost_settings'

export const useGetSiaAnnos = (annotationRequestData) => {
    return useQuery(
        ['getsiaannos', annotationRequestData],
        () =>
            axios
                .get(
                    `${API_URL}/sia?direction=${annotationRequestData.direction}&lastImgId=${annotationRequestData.imageId}`,
                )
                .then((res) => res.data),
        {
            enabled: !!annotationRequestData,
            refetchOnWindowFocus: false,
        },
    )
}

export const useGetSiaImage = (imageId) => {
    return useQuery(
        ['getsiaimage', imageId],
        () =>
            axios
                .get(`${API_URL}/data/image/${imageId}?type=imageBased`)
                .then((res) => res.data),
        {
            // only fetch when imageId is available
            // request will automatically refetch when value changes
            enabled: !!imageId,
            refetchOnWindowFocus: false,
        },
    )
}
