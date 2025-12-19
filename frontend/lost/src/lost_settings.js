const IS_DEV = import.meta.env.MODE === 'development'
let apiUrl = ''

if (IS_DEV) {
  apiUrl = `${globalThis.location.origin.replace(/:\d+?$/, '')}:${import.meta.env.VITE_BACKEND_PORT}/api`
} else {
  apiUrl = `${globalThis.location.origin}/api`
}

const API_URL = apiUrl
export { API_URL }
