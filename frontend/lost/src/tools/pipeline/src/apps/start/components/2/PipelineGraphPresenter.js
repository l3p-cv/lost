import $ from "jquery"

import WizardTabPresenter from "wizard/WizardTabPresenter"
import appModel from "../../appModel"
import PipelineGraphView from "./PipelineGraphView"

import Graph from "graph/graph"
import ExampleNodePresenter from "graph/node/example/NodePresenter"
import ConfigPipelinePresener from "../3/ConfigPipelinePresenter"

import DatasourceNodePresenter from "graph/node/datasource/DatasourceNodePresenter"
import AnnoTaskNodePresenter from "graph/node/annoTask/AnnoTaskNodePresenter"
import DataExportNodePresenter from "graph/node/dataExport/DataExportNodePresenter"
import VisualOutputNodePresenter from "graph/node/visualOutput/VisualOutputNodePresenter"
import ScriptNodePresenter from "graph/node/script/ScriptNodePresenter"
import LoopNodePresenter from "graph/node/loop/LoopNodePresenter"



class PipelineGraphPresenter extends WizardTabPresenter {
    constructor() {
        super()
        this.view = PipelineGraphView
        this.validated = false
        
        // VIEW-BINDING
        // MODEL-BINDING
        
        appModel.controls.show2.on("update", () => this.show())  

        $(this.view.html.refs["btn-next"]).on('click', () => {
            appModel.controls.show3.update(true)            
        })

        $(this.view.html.refs["btn-prev"]).on('click', () => {
            appModel.controls.show1.update(true)
        })
        appModel.state.selectedTemplate.on("update", (data) => this.loadTemplate(data))


    }
    /**
     * @extend
     */
    // validate() {
    //     super.validate(() => {
    //         // ...
    //         return false
    //     })
    // }
    // @override
    isValidated(){
        return this.validated
    }
    /**
     * @extend
     */
    // deactivate() {
    //     super.deactivate(() => {
    //         // destroy graph (remove Modals)
    //     })
    // }
    loadTemplate(data) {
        // Reset the Data when graph was loaded seecond time
        console.log('=========get=Json==========================');
        console.log(data);
        console.log('====================================');
        ConfigPipelinePresener.reset()


        this.isThereGraph = true
        //data = TestJsonStartPipe
        // the graph must be initialized after switching tabs. 
        // the svg gets resized to its target container. 
        // if the container is displayed=none, it has no width.
        // the graph wont render well this way.
        this.show()
        // dont recreate the graph it it allready exists
        // if (this.graph !== undefined) {
        //     return
        // }

        try {
            
            $(this.graph.mountPoint.children[0]).remove()
            this.graph = undefined
        }
        catch(err) {
        }
        this.graph = new Graph(this.view.html.refs["dagre"])
        // create nodes and render the graph
        // data.requestTemplate()
        // ---------- DEBUG DATA
        // test with mocking objects

        const elements = data.elements
        const mode = "start"

        // ---------- DEBUG DATA
        
        const nodes = []
        elements.forEach(element => {
            if ('datasource' in element) {
                nodes.push(new DatasourceNodePresenter(this.graph, element, mode))
            } else if ('script' in element) {
                nodes.push(new ScriptNodePresenter(this.graph, element, mode))
            } else if ('annoTask' in element) {
                nodes.push(new AnnoTaskNodePresenter(this.graph, element, mode))
            } else if ('dataExport' in element) {
                nodes.push(new DataExportNodePresenter(this.graph, element, mode))
            } else if ('visualOutput' in element) {
                nodes.push(new VisualOutputNodePresenter(this.graph, element, mode))
            } else if ('loop' in element) {
                nodes.push(new LoopNodePresenter(this.graph, element, mode))
            }
        })


        

        
        nodes.forEach(n => {
            this.graph.addNode(n)
        })
        nodes.forEach(n => {
            if (n.constructor.name === "LoopNodePresenter") {
                this.graph.addEdge(n.model.peN, n.model.loop.peJumpId, true)
            }
            if (n.model.peOut !== null) {
                n.model.peOut.forEach(e => {
                    this.graph.addEdge(n.model.peN, e)
                })
            }
        })

        this.graph.centerGraph()
        

        appModel.state.checkNodesValidation.on("update", ()=>{
            const allNodePresenter = this.graph.graph._nodes
            Object.keys(allNodePresenter).every(n => {
                if (allNodePresenter[n].nodePresenter.model.validation !== undefined) {
                    if(allNodePresenter[n].nodePresenter.model.validation === false){
                        this.validated = false
                        return false
                    }else{
                        this.validated = true
                        return true
                    }
                }
            })
            if(this.validated){
                $(this.view.html.refs["btn-next"]).prop("disabled", false)                
            }else{
                $(this.view.html.refs["btn-next"]).prop("disabled", true)
            }
        })
        appModel.state.checkNodesValidation.update(true)
        



     
        // this.graph.enableZoomCenterGraph()

        /*


               
        */


        //  this.graph.render()
    }

}
export default new PipelineGraphPresenter()