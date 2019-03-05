// Production API URL - this url locates to nginx web server which is
// hosting this app. Reverse Proxy to Flask API is configured in nginx configuration.
// To make changes to the API URL, the reverse proxy configuration must be modified.
const DEV = true

let API_URL = ""
if(DEV){
	console.warn('TURN OF DEV MODE IN PRODUCTION')
	API_URL = `${window.location.origin.replace(/:\d+?$/, "")}/api`
} else {
	API_URL = `${window.location.origin}/api`
}
export { API_URL }

export const roles = ['Designer', 'Annotater']