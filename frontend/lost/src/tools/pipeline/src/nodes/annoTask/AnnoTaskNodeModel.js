import { Observable } from 'pipRoot/l3pfrontend/index'


export default class AnnoTaskNodeModel {
    constructor(data, mode) {
        if(data === undefined || data.peN === undefined){
            throw new Error('data is undefined or has no peN property.')
        }
        if(mode === 'start'){
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
            this.post.annoTask.groups = []
            this.meta = {}
            this.meta.labelLeaves = []
            this.meta.assignee = ''
            this.validation = false
			this.controls = {
				show1: new Observable(true),
				show2: new Observable(false),
				show3: new Observable(false),
				show4: new Observable(false),
			}
        } else if(mode === 'running'){
            this.peN = data.peN
            this.peOut = data.peOut
            this.id = data.id
            this.annoTask = data.annoTask
            this.state = new Observable(data.state)
            this.progress = new Observable(data.annoTask.progress? data.annoTask.progress: 0)
        }
    }
}