/**
* browser name is saved here.
*/
export const BROWSER_NAME = (() => {
    var userAgentString = navigator.userAgent,
    result = ""
    // check useragent string
    if ((userAgentString.includes("Opera") || userAgentString.includes('OPR'))) {
        result = "Opera"
    } else if (userAgentString.includes("Chrome")) {
        result = "Chrome"
    } else if (userAgentString.includes("Safari")) {
        result = "Safari"
    } else if (userAgentString.includes("Firefox")) {
        result = "Firefox"
    } else if (userAgentString.includes("MSIE")){
        result = "Internet Explorer 10"
    } else if (userAgentString.includes("Trident")){
        result = "Internet Explorer 11"
    } else if (userAgentString.includes("Edge")){
        result = "Edge"
    } else {
        result = "unknown"
    }
    return result
})()
