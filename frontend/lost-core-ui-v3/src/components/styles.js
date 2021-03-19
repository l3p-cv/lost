export const centered = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
}
export const grayTopBottomBorder = {
    borderTop: '3px solid lightgray',
    borderBottom: '3px solid lightgray',
    padding: 5,
}
export const grayLeftBorder = { borderLeft: '3px solid lightgray' }
const SUCCESS_COLOR_CODE = '#28a745'
const WARNING_COLOR_CODE = '#ffc107'
const INFO_COLOR_CODE = '#17a2b8'
const DANGER_COLOR_CODE = '#dc3545'
const PRIMARY_COLOR_CODE = '#007bff'
const SECONDARY_COLOR_CODE = '#6c757d'


export const bsColorSelector = (className) => {
    switch (className){
        case 'success':
            return SUCCESS_COLOR_CODE
        case 'warning':
            return WARNING_COLOR_CODE
        case 'danger':
            return DANGER_COLOR_CODE
        case 'primary':
            return PRIMARY_COLOR_CODE
        case 'info':
            return INFO_COLOR_CODE
        case 'secondary':
            return SECONDARY_COLOR_CODE
        default:
            return DANGER_COLOR_CODE
    }
}

