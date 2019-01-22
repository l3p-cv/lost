import axios from 'axios'
import TYPES from '../../types/index'
import {API_URL} from '../../settings'
import {http} from 'l3p-frontend'

axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')

export const getMiaAnnos = (maxAmount) => async dispatch => {
    try {
        const response = await axios.get(API_URL + '/mia/next/' + maxAmount)
        dispatch({type: TYPES.GET_MIA_ANNOS, payload: response.data})
    } catch (e) {console.log(e)}
}

export const getMiaImage = (path) => async dispatch =>{
  
        const config = {
            url: API_URL +'/'+ path,
            type: 'image',
            token: localStorage.getItem('token')
        }
        return await http.get(config)
}