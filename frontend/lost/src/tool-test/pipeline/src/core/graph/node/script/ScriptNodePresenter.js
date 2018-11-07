import $ from "jquery"

import BaseNodePresenter from "../BaseNodePresenter"

import ScriptNodeModel from "./ScriptNodeModel"

import NormalRunningView from "./views/ScriptNormalRunningView"
import NormalStartView from "./views/ScriptNormalStartView"
import DebugRunningView from "./views/ScriptDebugRunningView"
import DebugStartView from "./views/ScriptDebugStartView"
import ScriptRunningModal from "./modals/ScriptRunningModal"
import ScriptStartModal from "./modals/ScriptStartModal"

import appModelRunning from "apps/running/appModel"
import appModelStart from "apps/start/appModel"
import graph from "graph/graph"


export default class ScriptNodePresenter extends BaseNodePresenter {

    /**
     * @param {*} data Specific data to fill the Graph-Node with.
     */
    constructor(graph, data, mode) {
        super(graph)
        // create model
        this.model = new ScriptNodeModel(data, mode)
        // create view
        switch (mode) {
            case "running":
                appModelRunning.isDebug
                    ? this.view = new DebugRunningView(this.model)
                    : this.view = new NormalRunningView(this.model)
                this.modal = new ScriptRunningModal(this.model)
                break
            case "start":
                appModelStart.isDebug
                    ? this.view = new DebugStartView(this.model)
                    : this.view = new NormalStartView(this.model)
                this.modal = new ScriptStartModal(this)
                $(this.modal.view.root).on('hidden.bs.modal', () => {
                    this.graph.updateNode(this)
                })
                break
            default:
                throw new Error(`no node view available for ${data.type}`)
        }



        $(this.modal.view.refs["more-information-link"]).on("click", () => {
            $(this.modal.view.refs["collapse-this"]).collapse('toggle')
            $(this.modal.view.refs["more-information-icon"]).toggleClass("fa-chevron-down fa-chevron-up");
        })
    }


    /**
     * @override
     */
    initViewBinding() {
        $(this.view.parentNode).on("mousedown", "[data-ref='checkbox']", () => {
            this.model.post.script.isDebug = !this.model.post.script.isDebug
            this.view = new DebugStartView(this.model)
            this.graph.updateNode(this)
        })

        $(this.view.parentNode).on("mouseover", (e) => {
            // show tooltip...
        })
    }

    /**
     * @override
     */
    initModelBinding() {
        if (this.view instanceof NormalRunningView || this.view instanceof DebugRunningView) {
            // update view
            // @note: two options to access the view parts via delegation.
            //  1. this.view.parentNode.querySelector(`[data-ref="state"]`)
            //  2. $(this.view.parentNode).find(`[data-ref="state"]`)
            this.model.progress.on("update", number => {
                this.view.parentNode.querySelector(`[data-ref="progress-bar"]`).style.width = `${number}%`
                this.view.parentNode.querySelector(`[data-ref="progress-bar-text"]`).textContent = `${number}%`

            })
            this.model.state.on("update", text => {
                this.view.parentNode.querySelector(`[data-ref="state"]`).setAttribute("class", `panel-footer 
                    ${ text == "script_error" ? "bg-red" : ""}
                    ${ text == "pending" ? "bg-blue" : ""}
                    ${ text == "in_progress" ? "bg-orange" : ""}
                    ${ text == "finished" ? "bg-green" : ""}`)
                this.view.parentNode.querySelector(`[data-ref="state-text"]`).textContent = text.replace("_", " ")
            })

            // update modal
            this.model.progress.on("update", number => {
                this.modal.view.refs["progress-bar"].style.width = `${number}%`
                this.modal.view.refs["progress-bar-text"].textContent = `${number ? number : 0}%`
            })
            this.model.errorMsg.on("update", text => {
                if (text !== null) {
                    this.modal.view.refs["error-msg"].style.display = "block"
                    this.modal.view.refs["error-msg-text"].textContent = text
                }
                else {
                    this.modal.view.refs["error-msg"].style.display = "none"
                    this.modal.view.refs["error-msg-text"].textContent = ""
                }
            })
            this.model.state.on("update", text => {
                this.modal.view.refs["state"].textContent = text
            })
        }
    }
}





