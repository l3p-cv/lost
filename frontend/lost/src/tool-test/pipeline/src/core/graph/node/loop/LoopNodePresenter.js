import BaseNodePresenter from "../BaseNodePresenter"

import LoopNodeModel from "./LoopNodeModel"

import LoopRunningView from "./views/LoopRunningView"
import LoopStartView from "./views/LoopStartView"

import LoopRunningModal from "./modals/LoopRunningModal"
import LoopStartModal from "./modals/LoopStartModal"

import graph from "graph/graph"


export default class LoopNodePresenter extends BaseNodePresenter {

    /**
     * @param {*} data Specific data to fill the Graph-Node with.
     */
    constructor(graph, data, mode) {      
        super(graph)
        // create model
        this.model = new LoopNodeModel(data, mode)
        // create view
        switch(mode){
            case "running":
                this.view = new LoopRunningView(this.model)
                this.modal = new LoopRunningModal(this.model)

                break
            case "start":
                this.view = new LoopStartView(this.model)
                this.modal = new LoopStartModal(this.model)
                $(this.modal.view.refs["max-iteration"]).on('input', (e)=>{
                    this.model.loop.maxIteration = e.currentTarget.value
                    this.view = new LoopStartView(this.model)
                })
                $(this.modal.view.root).on('hidden.bs.modal',() => {
                    this.graph.updateNode(this)           
                })
                break
            default: throw new Error(`no node view available for ${data.type}`)
        }
    }


    /**
     * @override
     */
    initViewBinding(){
        if(this.view instanceof LoopRunningView){
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