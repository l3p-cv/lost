const IS_DEV = process.env.NODE_ENV === 'development';
let apiUrl = '';
if (IS_DEV) {
	apiUrl = `${window.location.origin.replace(/:\d+?$/, "")}:${process.env.REACT_APP_PORT}/api`
} else {
  apiUrl = `${window.location.origin}/api`;
}
const API_URL = apiUrl
export {API_URL}