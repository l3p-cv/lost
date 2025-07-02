import { useState, useCallback, useRef } from 'react'
import axios from 'axios'
import { API_URL } from '../../lost_settings'
import { useMutation } from 'react-query'

export const useGetFSList = () => {
    return useMutation((visLevel) =>
        axios.get(API_URL + `/fb/fslist/${visLevel}`).then((res) => res.data),
    )
}

export const useGetPossibleFsTypes = () => {
    return useMutation(() => axios.get(API_URL + '/fb/fstypes').then((res) => res.data))
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
        axios.post(API_URL + '/fb/delete', { fs: fs }).then((res) => res.data),
    )
}

export const useSaveFs = () => {
    return useMutation((fs) =>
        axios.post(API_URL + '/fb/savefs', fs).then((res) => res.data),
    )
}

export const useGetFullFs = () => {
    return useMutation((fs) =>
        axios.post(API_URL + '/fb/fullfs', { id: fs.id }).then((res) => res.data),
    )
}

export const useUploadFiles = () => {
    const isUploadBreaked = useRef(false)
    const [state, setState] = useState({
        idle: true,
        progress: null,
        isSuccess: false,
        error: null,
    })

    const breakUpload = () => {
        isUploadBreaked.current = true
    }

    const mutate = useCallback(async (obj) => {
        const formData = new FormData()
        obj.files.forEach((file) => {
            formData.append('file[]', file)
        })
        formData.append('fsId', obj.fsId)
        formData.append('path', obj.path)

        setState({
            idle: false,
            progress: 0,
            isSuccess: false,
            error: null,
        })

        try {
            const cancelTokenSource = axios.CancelToken.source()
            const response = await axios.request({
                method: 'post',
                cancelToken: cancelTokenSource.token,
                url: `${API_URL}/fb/upload`,
                data: formData,
                onUploadProgress: (p) => {
                    if (isUploadBreaked.current) {
                        cancelTokenSource.cancel()
                    }
                    setState((prev) => ({
                        ...prev,
                        progress: p.loaded / p.total,
                    }))
                },
            })

            setState((prev) => ({
                ...prev,
                isSuccess: response.data === 'success',
                idle: true,
            }))
        } catch (error) {
            setState({
                idle: true,
                progress: null,
                isSuccess: false,
                error,
            })
        }
    }, [])

    return [state, mutate, breakUpload]
}


export const useDeleteFiles = () => {
    return useMutation(({ fs, files }) =>
        axios.post(API_URL + '/fb/rm', { fsId: fs.id, files }).then((res) => res.data),
    )
}

export const useMkDir = () => {
    return useMutation(({ fs, path, name }) =>
        axios
            .post(API_URL + '/fb/mkdirs', { fsId: fs.id, path, name })
            .then((res) => res.data),
    )
}

export const checkIfPathExists = async (fs, path) => {
    try {
        const res = await axios.post(`${API_URL}/fb/check-path`, {
            fsId: fs.id,
            path,
        });
        return res.data.exists;
    } catch (err) {
        console.error('Path check failed:', err);
        return false;
    }
};