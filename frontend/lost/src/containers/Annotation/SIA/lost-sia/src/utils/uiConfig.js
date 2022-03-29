export const SIA_INITIAL_UI_CONFIG = {
    nodeRadius: 4,
    strokeWidth: 4,
    annoDetails:{
        visible: false
    },
    labelInfo:{
        visible: false
    },
    annoStats:{
        visible: false
    }
}

// read sia-ui-config from localStorage 
const iniFromStorage = localStorage.getItem('sia-ui-config') ? JSON.parse(localStorage.getItem('sia-ui-config')) : SIA_INITIAL_UI_CONFIG


// collect object keys and its type in order to describe the object
const collectDescription = (obj, array) => {
    Object.keys(obj).forEach(key => {
        
        const description = {
            key: key,
            type: typeof(obj[key])
        }
        array.push(description)

        if (typeof obj[key] === 'object') {
            collectDescription(obj[key], array)
        } 
    })
}

// collect object description for ini and storage ui-config

let iniObjectDescriptor = []
let storageObjectDescriptor = []

collectDescription(SIA_INITIAL_UI_CONFIG, iniObjectDescriptor)
collectDescription(iniFromStorage, storageObjectDescriptor)


// compare both object descriptions

const getUiConfig = () => {
    if (JSON.stringify(iniObjectDescriptor) === JSON.stringify(storageObjectDescriptor)){
        return iniFromStorage
    }
    else {
        // ini description dif from storage: send ini ui-config and store it to local storage
        localStorage.setItem('sia-ui-config', JSON.stringify(SIA_INITIAL_UI_CONFIG)) 
        return SIA_INITIAL_UI_CONFIG
    }
}

export const uiConfig = getUiConfig()

