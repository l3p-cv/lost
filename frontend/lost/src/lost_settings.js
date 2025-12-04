const IS_DEV = import.meta.env.MODE === 'development' // Use `import.meta.env.MODE` for the mode
let apiUrl = ''

if (IS_DEV) {
  apiUrl = `${window.location.origin.replace(/:\d+?$/, '')}:${import.meta.env.VITE_BACKEND_PORT}/api`
} else {
  apiUrl = `${window.location.origin}/api`
}

const API_URL = apiUrl
export { API_URL }
