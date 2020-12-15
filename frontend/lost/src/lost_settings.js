// Production API URL - this url locates to nginx web server which is
// hosting this app. Reverse Proxy to Flask API is configured in nginx configuration.
// To make changes to the API URL, the reverse proxy configuration must be modified.
const IS_DEV = process.env.NODE_ENV === "development" 
let API_URL 
if(IS_DEV){ 
	API_URL = `${window.location.origin.replace(/:\d+?$/, "")}:${process.env.REACT_APP_PORT}/api` } 
else { 
	API_URL = `${window.location.origin}/api` } 
export { API_URL } 
export const roles = ['Designer', 'Annotater']