import Swal from 'sweetalert2'
import * as REQUEST_STATUS from '../types/requestStatus'
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
})

const TimerToast = Swal.mixin({
    toast: true,
    timer: 3000,
    timerProgressBar: true,
    position: 'top-end',
    showConfirmButton: false,
})

export const showLoading = () => {
    Toast.fire({
        title: 'Loading...',
    })
}

export const showSuccess = (text) => {
    TimerToast.fire({
        icon: 'success',
        title: text,
    })
}

export const showError = (text, timer = 3000) => {
    TimerToast.fire({
        icon: 'error',
        timer: timer,
        title: text,
    })
}

export const close = () => {
    Toast.close()
}

export const handling = (status, successText) => {
    if (REQUEST_STATUS.LOADING === status) {
        showLoading()
    } else if (REQUEST_STATUS.SUCCESS === status) {
        showSuccess(successText)
    }
}

export const networkRequest = (requestStatus) => {
    if (requestStatus.status) {
        if (REQUEST_STATUS.LOADING === requestStatus.status) {
            showLoading()
        } else if (REQUEST_STATUS.SUCCESS === requestStatus.status) {
            showSuccess(requestStatus.message)
        } else if (REQUEST_STATUS.FAILED === requestStatus.status) {
            showError(requestStatus.message)
        }
    }
}

export const showDecision = ({
    title = '',
    icon = 'info',
    html = '',
    option1,
    option2,
    target = document.getElementById('popup-root'),
}) => {
    Swal.fire({
        target,
        title,
        icon,
        html,
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: option1.text,
        cancelButtonText: option2.text,
    }).then((result) => {
        if (result.isConfirmed) {
            option1.callback()
        } else if (
            !result.isConfirmed &&
            result.dismiss === 'cancel' &&
            option2.callback
        ) {
            option2.callback()
        }
    })
}
