import BaseNodePresenter from "../BaseNodePresenter"
import DataExportNodeModel from "./DataExportNodeModel"

import DataExportRunningView from "./views/DataExportRunningView"
import DataExportStartView from "./views/DataExportStartView"

import DataExportRunningModal from "./modals/DataExportRunningModal"
import DataExportStartModal from "./modals/DataExportStartModal"


import graph from "graph/graph"


export default class DataExportNodePresenter extends BaseNodePresenter {

    /**
     * @param {*} data Specific data to fill the Graph-Node with.
     */
    constructor(graph, data, mode) {
        super(graph)                                    
        // create model
        this.model = new DataExportNodeModel(data, mode)
        // create view
        switch(mode){
            case "running":
                this.view = new DataExportRunningView(this.model)
                this.modal = new DataExportRunningModal(this.model)
                break
            case "start":
                this.view = new DataExportStartView(this.model)
                this.modal = new DataExportStartModal(this.model)
                break
            default: throw new Error(`no node view available for ${data.type}`)
        }
    }


    /**
     * @override
     */
    initViewBinding(){
        if(this.view instanceof DataExportRunningView){
            // update view
            // @note: two options to access the view parts via delegation.
            //  1. this.view.parentNode.querySelector(`[data-ref="state"]`)
            //  2. $(this.view.parentNode).find(`[data-ref="state"]`)
            this.model.state.on("update", text => {
                this.view.parentNode.querySelector(`[data-ref="state"]`).setAttribute("class", `panel-footer 
                    ${ text == "script_error"   ? "bg-red"      : "" }
                    ${ text == "pending"        ? "bg-blue"     : "" }
                    ${ text == "in_progress"    ? "bg-orange"   : "" }
                    ${ text == "finished"       ? "bg-green"    : "" }`)
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