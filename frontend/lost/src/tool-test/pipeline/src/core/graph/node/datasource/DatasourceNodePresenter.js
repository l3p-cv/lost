import BaseNodePresenter from "../BaseNodePresenter"
import DatasourceNodeModel from "./DatasourceNodeModel"

import DatasourceRunningView from "./views/DatasourceRunningView"
import DatasourceStartView from "./views/DatasourceStartView"

import DatasourceRunningModal from "./modals/DatasourceRunningModal"
import DatasourceStartModal from "./modals/DatasourceStartModal"


import graph from "graph/graph"


export default class DatasourceNodePresenter extends BaseNodePresenter {

    /**
     * @param {*} data Specific data to fill the Graph-Node with.
     */
    constructor(graph, data, mode) {
        super(graph)                            
        // create model
        this.model = new DatasourceNodeModel(data, mode)
        // create view
        switch(mode){
            case "running":
                this.view = new DatasourceRunningView(this.model)
                this.modal = new DatasourceRunningModal(this.model)
                break
            case "start":
                this.view = new DatasourceStartView(this.model)
                this.modal = new DatasourceStartModal(this)
                $(this.modal.view.root).on('shown.bs.modal',() => {
                    if(this.modal.view.refs["inputAvailableRawFiles"]){
                        this.modal.view.refs["inputAvailableRawFiles"].focus()
                    }
                })
                $(this.modal.view.root).on('hidden.bs.modal',() => {
                    this.graph.updateNode(this)           
                })
                break
            default: throw new Error(`no node view available for ${data.type}`)
        }

        $(this.modal.view.refs["more-information-link"]).on("click", () =>{
            $(this.modal.view.refs["collapse-this"]).collapse('toggle')
            $(this.modal.view.refs["more-information-icon"]).toggleClass("fa-chevron-down fa-chevron-up");
        })
    }


    /**
     * @override
     */
    initViewBinding(){
        if(this.view instanceof DatasourceRunningView){
            // update view
            // @note: two options to access the view parts via delegation.
            //  1. this.view.parentNode.querySelector(`[data-ref="state"]`)
            //  2. $(this.view.parentNode).find(`[data-ref="state"]`)
            $(this.view.html.root).on("click", $event => {
                console.warn("CLICK")
            })
            this.model.state.on("update", text => {
                this.view.parentNode.querySelector(`[data-ref="state"]`).setAttribute("class", `panel-footer 
                    ${ text == "script_error"   ? "bg-red"      : "" }
                    ${ text == "pending"        ? "bg-blue"     : "" }
                    ${ text == "in_progress"    ? "bg-orange"   : "" }
                    ${ text == "finished"       ? "bg-green"    : "" }`)
                this.view.parentNode.querySelector(`[data-ref="state-text"]`).textContent = text.replace("_", " ")
            })
            // update modal
            this.model.state.on("update", text => {
                this.modal.view.refs["state"].textContent = text
            })
        }
    }

    /**
     * @override
     */
    initModelBinding(){

    }
}