export const getColor = (progress) => {
    if (progress < 25) {
        return 'danger'
    }
    if (progress < 50) {
        return 'warning'
    }
    if (progress < 75) {
        return 'info'
    }
    return 'success'
}