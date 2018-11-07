import { Observable } from "l3p-core"

export default class AnnoTaskNodeModel {
    constructor(data, mode) {
        if(data === undefined || data.peN == undefined){
            throw new Error("data is undefined or has no peN property.")
        }
        if(mode === "start"){
            this.peN = data.peN
            this.peOut = data.peOut
            this.annoTask = data.annoTask
            // Extras for Post
            this.post = {}
            this.post.peN = data.peN
            this.post.annoTask = {}
            this.post.annoTask.name = data.annoTask.name
            this.post.annoTask.instructions = data.annoTask.instructions
            this.post.annoTask.workerId = undefined
            this.post.annoTask.labelLeaves = []
            this.meta = {}
            this.meta.labelLeaves = []
            this.meta.assignee = ""
            this.validation = false
        }else if(mode == "running"){
            this.peN = data.peN
            this.peOut = data.peOut
            this.id = data.id
            this.annoTask = data.annoTask
            this.state = new Observable(data.state)
            this.progress = new Observable(data.annoTask.progress? data.annoTask.progress: 0)
            // Can the labelLeaves be changed?
        }
        
    }
}