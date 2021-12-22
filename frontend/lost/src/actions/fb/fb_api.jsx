import axios from 'axios'
import { API_URL } from '../../lost_settings'
import { useMutation } from 'react-query'

export const useGetFSList = () => {
    return useMutation((visLevel) => 
        axios.get(API_URL + `/fb/fslist/${visLevel}`).then(res => res.data),
    )
}

export const useGetPossibleFsTypes = () => {
    return useMutation(() => 
        axios.get(API_URL + '/fb/fstypes').then(res => res.data),
    )

}


// export async function ls(fs, path) {
//     const res = await axios.post(API_URL + '/fb/ls', { fs: fs, path: path })
//     return res.data
// }

// export async function lsTest(fs, path) {
//     const res = await axios.post(API_URL + '/fb/lsTest', { fs: fs, path: path })
//     return res.data
// }

export const useDeleteFs = () => {
    return useMutation((fs) => 
        axios.post(API_URL + '/fb/delete', { fs: fs }).then(res => res.data),
    )
}

export const useSaveFs = () => {
    return useMutation((fs) => 
        axios.post(API_URL + '/fb/savefs', fs).then(res => res.data),
    )
}

export const useGetFullFs = () => {
    return useMutation((fs) => 
        axios.post(API_URL + '/fb/fullfs', {id: fs.id}).then(res => res.data),
    )
}