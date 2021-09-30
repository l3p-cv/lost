const errorResolver = (error) =>{
    const errorResponse = error.request.response
    let errorMessage = errorResponse
    if(errorMessage){
        try {
            errorMessage = JSON.parse(errorResponse).message
            // eslint-disable-next-line no-empty
        } catch {

        }
    }else{
        errorMessage = 'Server not responding'
    }
    return errorMessage

}

export default errorResolver
