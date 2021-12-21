import axios from 'axios'
import { API_URL } from '../lost_settings'

export async function getFSList(visLevel) {
    const res = await axios.get(API_URL + `/fb/fslist/${visLevel}`)
    return res.data
}

export async function getPossibleFsTypes() {
    const res = await axios.get(API_URL + '/fb/fstypes')
    return res.data
}

export async function ls(fs, path) {
    const res = await axios.post(API_URL + '/fb/ls', { fs: fs, path: path })
    return res.data
}

export async function lsTest(fs, path) {
    const res = await axios.post(API_URL + '/fb/lsTest', { fs: fs, path: path })
    return res.data
}

export async function deleteFs(fs) {
    const res = await axios.post(API_URL + '/fb/delete', { fs: fs })
    return res.data
}

export async function saveFs(fs) {
    const res = await axios.post(API_URL + '/fb/savefs', fs)
}

export async function getFullFs(fs) {
    const res = await axios.post(API_URL + '/fb/fullfs', {id: fs.id})
    return res.data
}