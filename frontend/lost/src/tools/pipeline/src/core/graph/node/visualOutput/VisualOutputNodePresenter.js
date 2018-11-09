import BaseNodePresenter from "../BaseNodePresenter"
import VisualOutputNodeModel from "./VisualOutputNodeModel"

import VisualOutputRunningView from "./views/VisualOutputRunningView"
import VisualOutputStartView from "./views/VisualOutputStartView"

import VisualOutputRunningModal from "./modals/VisualOutputRunningModal"
import VisualOutputStartModal from "./modals/VisualOutputStartModal"


import graph from "graph/graph"


export default class VisualOutputNodePresenter extends BaseNodePresenter {

    /**
     * @param {*} data Specific data to fill the Graph-Node with.
     */
    constructor(graph, data, mode) {        
        super(graph)
        // create model
        this.model = new VisualOutputNodeModel(data,mode)
        // create view
        switch(mode){
            case "running":
                this.view = new VisualOutputRunningView(this.model)
                this.modal = new VisualOutputRunningModal(this.model)
                break
            case "start":
                this.view = new VisualOutputStartView(this.model) 
                this.modal = new VisualOutputStartModal(this.model) 
                break
            default: throw new Error(`no node view available for ${data.type}`)
        }
    }


    /**
     * @override
     */
    initViewBinding(){
        if(this.view instanceof VisualOutputRunningView){
            // update view
            // @note: two options to access the view parts via delegation.
            //  1. this.view.parentNode.querySelector(`[data-ref="state"]`)
            //  2. $(this.view.parentNode).find(`[data-ref="state"]`)
            this.model.state.on("update", text => {
                this.view.parentNode.querySelector(`[data-ref="state"]`).setAttribute("class", `panel-footer 
                    ${ text === "script_error"   ? "bg-red"      : "" }
                    ${ text === "pending"        ? "bg-blue"     : "" }
                    ${ text === "in_progress"    ? "bg-orange"   : "" }
                    ${ text === "finished"       ? "bg-green"    : "" }`)
                this.view.parentNode.querySelector(`[data-ref="state-text"]`).textContent = text.replace("_", " ")
            })
        }
    }

    /**
     * @override
     */
    initModelBinding(){
    }
}