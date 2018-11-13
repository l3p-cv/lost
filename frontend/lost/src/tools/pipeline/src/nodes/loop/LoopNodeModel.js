import { Observable } from "l3p-frontend"


export default class LoopNodeModel {
    constructor(nodeData, mode) {
        if (nodeData === undefined || nodeData.peN === undefined) {
            throw new Error("nodeData is undefined or has no peN property.")
        }
        this.peN = nodeData.peN
        this.peOut = nodeData.peOut
        this.id = nodeData.id

        if (mode === "start") {
            this.loop = nodeData.loop
            this.validation = true
        } else if (mode === "running") {
            this.loop = nodeData.loop
            this.state = new Observable(nodeData.state)
        }

    }
}