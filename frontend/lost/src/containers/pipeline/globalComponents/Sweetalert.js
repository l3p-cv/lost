import Swal from 'sweetalert2'

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false
})


export const alertLoading = () => {
    Toast.fire({
        title: 'Loading...'
    })
    // Swal.fire({
    //     title: 'Loading...',
    //     onBeforeOpen: () => {
    //         Swal.showLoading()
    //     }
    // })
}

export const alertClose = () => {
    Swal.close()
}

export const alertSuccess = (title) => {
    Swal.fire({
        position: 'top-end',
        type: 'success',
        title: title,
        showConfirmButton: false,
        timer: 1500
    })
}

export const alertError = (error) => {
    Swal.fire({
        position: 'top-end',
        type: 'error',
        title: error,
        showConfirmButton: false,
        timer: 4000
    })
}

export const alertDeletePipeline = (id) => {
    return Swal.fire({
        title: 'Do you really want to delete the Pipeline?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: 'primary',
        confirmButtonText: 'Yes, delete it!'
    })
}
