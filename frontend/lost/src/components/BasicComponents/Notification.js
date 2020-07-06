import Swal from 'sweetalert2'
import * as REQUEST_STATUS from '../../types/requestStatus'
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false
})

const TimerToast = Swal.mixin({
    toast: true,
    timer: 3000,
    timerProgressBar: true,
    position: 'top-end',
    showConfirmButton: false
})

export const showLoading = () => {
    Toast.fire({
        title: 'Loading...'
    })
}

export const showSuccess = (text) => {
    TimerToast.fire({
        icon: 'success',
        title: text
    })
}

export const showError = (text) => {
    TimerToast.fire({
        icon: 'error',
        title: text
    })
}

export const closeNotification = () => {
    Toast.close()
}

export const handling = (status, successText) => {
    if(REQUEST_STATUS.LOADING === status) {
        showLoading()
    }else if(REQUEST_STATUS.SUCCESS === status) {
        showSuccess(successText)
    }
}


