import Swal from 'sweetalert2'

export const alertLoading =  () => {
    Swal.fire({
        title: 'Loading...',
        onBeforeOpen: () => {
            Swal.showLoading()
        }
    })
}

export const alertClose = () =>{
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

 export  const  alertDeletePipeline=  (id) => {
    return Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      })
}
