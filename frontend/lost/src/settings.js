// Production API URL - this url locates to nginx web server which is
// hosting this app. Reverse Proxy to Flask API is configured in nginx configuration.
// To make changes to the API URL, the reverse proxy configuration must be modified.
export const API_URL = `${window.location.origin}/api`

// Just for DEV - Adapt URL (Comment in) here if you are using npm dev server.
//export const API_URL = `http://localhost/api`
export const roles = ['Designer', 'Annotater']