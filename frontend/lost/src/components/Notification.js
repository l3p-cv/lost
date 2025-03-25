import Swal from 'sweetalert2'

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
    showCloseButton: true,
})

export const showLoading = () => {
    Toast.fire({
        title: 'Loading...',
    })
}

export const showSuccess = (text, timer = 3000) => {
    TimerToast.fire({
        icon: 'success',
        title: text,
        timer: timer,
    })
}

export const showError = (text, timer = 3000) => {
    TimerToast.fire({
        icon: 'error',
        timer: timer,
        title: text,
    })
}

export const showWarning = (text) => {
    TimerToast.fire({
        icon: 'warning',
        title: text,
    })
}

export const showInfo = (text) => {
    TimerToast.fire({
        icon: 'info',
        title: text,
    })
}

export const close = () => {
    Toast.close()
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
