import BaseNodePresenter from "../BaseNodePresenter"
import DatasourceNodeModel from "./DatasourceNodeModel"

import DatasourceRunningView from "./views/DatasourceRunningView"
import DatasourceStartView from "./views/DatasourceStartView"

import DatasourceRunningModal from "./modals/DatasourceRunningModal"
import DatasourceStartModal from "./modals/DatasourceStartModal"


export default class DatasourceNodePresenter extends BaseNodePresenter {
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

        // VIEW BINDINGS
        $(this.modal.view.refs["more-information-link"]).on("click", () =>{
            $(this.modal.view.refs["collapse-this"]).collapse('toggle')
            $(this.modal.view.refs["more-information-icon"]).toggleClass("fa-chevron-down fa-chevron-up")
        })
    }
    /**
     * @override
     */
    initViewBinding(){
        if(this.view instanceof DatasourceRunningView){
            $(this.view.html.root).on("click", $event => {
                console.warn("CLICK")
            })
            this.model.state.on("update", text => {
                this.view.parentNode.querySelector(`[data-ref="state"]`).setAttribute("class", `panel-footer 
                    ${ text === "script_error"   ? "bg-red"      : "" }
                    ${ text === "pending"        ? "bg-blue"     : "" }
                    ${ text === "in_progress"    ? "bg-orange"   : "" }
                    ${ text === "finished"       ? "bg-green"    : "" }`)
                this.view.parentNode.querySelector(`[data-ref="state-text"]`).textContent = text.replace("_", " ")
            })
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