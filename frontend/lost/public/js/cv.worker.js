/**
 * With OpenCV we have to work the images as cv.Mat (matrices),
 * so the first thing we have to do is to transform the
 * ImageData to a type that openCV can recognize.
 */


function imageProcessing({ msg, payload }) {
    const img = cv.matFromImageData(payload)
    let result = new cv.Mat()
    // What this does is convert the image to a grey scale.
    cv.cvtColor(img, img, cv.COLOR_BGR2GRAY)
    cv.equalizeHist(img, result);
    postMessage({ msg, payload: imageDataFromMat(result) })
  }
  
  /**
   * This function is to convert again from cv.Mat to ImageData
   */
  function imageDataFromMat(mat) {
    // convert the mat type to cv.CV_8U
    const img = new cv.Mat()
    const depth = mat.type() % 8
    const scale =
      depth <= cv.CV_8S ? 1.0 : depth <= cv.CV_32S ? 1.0 / 256.0 : 255.0
    const shift = depth === cv.CV_8S || depth === cv.CV_16S ? 128.0 : 0.0
    mat.convertTo(img, cv.CV_8U, scale, shift)
  
    // convert the img type to cv.CV_8UC4
    switch (img.type()) {
      case cv.CV_8UC1:
        cv.cvtColor(img, img, cv.COLOR_GRAY2RGBA)
        break
      case cv.CV_8UC3:
        cv.cvtColor(img, img, cv.COLOR_RGB2RGBA)
        break
      case cv.CV_8UC4:
        break
      default:
        throw new Error(
          'Bad number of channels (Source image must have 1, 3 or 4 channels)'
        )
    }
    const clampedArray = new ImageData(
      new Uint8ClampedArray(img.data),
      img.cols,
      img.rows
    )
    img.delete()
    return clampedArray
  }
  
  /**
   *  Here we will check from time to time if we can access the OpenCV
   *  functions. We will return in a callback if it has been resolved
   *  well (true) or if there has been a timeout (false).
   */
  function waitForOpencv(callbackFn, waitTimeMs = 30000, stepTimeMs = 100) {
    if (cv.Mat) callbackFn(true)
  
    let timeSpentMs = 0
    const interval = setInterval(() => {
      const limitReached = timeSpentMs > waitTimeMs
      if (cv.Mat || limitReached) {
        clearInterval(interval)
        return callbackFn(!limitReached)
      } else {
        timeSpentMs += stepTimeMs
      }
    }, stepTimeMs)
  }
  
  /**
   * This exists to capture all the events that are thrown out of the worker
   * into the worker. Without this, there would be no communication possible
   * with our project.
   */
  onmessage = function (e) {
    switch (e.data.msg) {
      case 'load': {
        // Import Webassembly script
        console.log("self")
        console.log(self.importScripts)
        self.importScripts('./opencv.js')
        waitForOpencv(function (success) {
          if (success) postMessage({ msg: e.data.msg })
          else throw new Error('Error on loading OpenCV')
        })
        break
      }
      case 'imageProcessing':
        return imageProcessing(e.data)
      default:
        break
    }
  }
  