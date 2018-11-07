// Some options to pass to the uploader are discussed on the next page
var uploader = new qq.FineUploader({
    element: document.getElementById("uploader"),
    retry: {
    enableAuto: true, // defaults to false
    maxAutoAttempts: 50
 },
    validation: {
      acceptFiles: 'application/zip',
      allowedExtensions: ['zip'],
    },
})
