import { Observable } from "l3p-frontend"

export default class ScriptNodeModel {
    constructor(nodeData, mode) {
        if(nodeData === undefined || nodeData.peN === undefined){
            throw new Error("nodeData is undefined or has no peN property.")
        }

        this.peN = nodeData.peN
        this.peOut = nodeData.peOut
        this.id = nodeData.id
        this.script = nodeData.script
        
        if(mode === "start"){
            this.validation = true
            // Post
            this.post = {}
            this.post.peN = nodeData.peN
            this.post.script = {}
            this.post.script.isDebug = false
            this.post.script.arguments = nodeData.script.arguments
        } else if (mode === "running"){
            this.state = new Observable(nodeData.state)
            this.progress = new Observable(nodeData.script.progress ? nodeData.script.progress: 0)
            this.errorMsg = new Observable(nodeData.script.errorMsg ? nodeData.script.errorMsg : "")
        }
    }
}