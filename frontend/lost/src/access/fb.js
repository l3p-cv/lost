import axios from 'axios'
import {API_URL} from '../lost_settings'

export async function getFSList() {
    const res = await axios.get(API_URL+'/fb/fslist')
    return res.data
}

export async function getPossibleFsTypes() {
    const res = await axios.get(API_URL+'/fb/fstypes')
    return res.data
}
// export function ls(fs, path, ret){
//     axios.post(API_URL+'/fb/ls', 
//         {'fs':fs, 'path':path}
//     ).then( resp => {ret(resp.data)})
// }

export async function ls(fs, path){
    const res = await axios.post(API_URL+'/fb/ls', 
        {'fs':fs, 'path':path}
    )
    return res.data
}

export async function saveFs(fs){
    const res = await axios.post(API_URL+'/fb/savefs', fs)
}