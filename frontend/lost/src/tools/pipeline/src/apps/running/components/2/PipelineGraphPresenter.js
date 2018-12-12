
import { WizardTabPresenter } from 'l3p-frontend'
import * as http from 'pipRoot/http'
import appModel from '../../appModel'
import PipelineGraphView from './PipelineGraphView'

import Graph from 'pipRoot/Graph'

import DatasourceNodePresenter from 'pipRoot/nodes/datasource/running/DatasourceRunningPresenter'
import AnnoTaskNodePresenter from 'pipRoot/nodes/annoTask/running/AnnoTaskRunningPresenter'
import DataExportNodePresenter from 'pipRoot/nodes/dataExport/running/DataExportRunningPresenter'
import VisualOutputNodePresenter from 'pipRoot/nodes/visualOutput/running/VisualOutputRunningPresenter'

import ScriptNodePresenter from 'pipRoot/nodes/script/running/ScriptRunningPresenter'
import LoopNodePresenter from 'pipRoot/nodes/loop/running/LoopRunningPresenter'

import swal from 'sweetalert2'


class PipelineGraphPresenter extends WizardTabPresenter {
    constructor() {
        super()
        this.view = PipelineGraphView

        // VIEW-BINDING
        // Delete Pipe
        $(this.view.html.refs['btn-delete-pipeline']).on('click', () => {
            let id = this.appData.id
            // result can be cancel, true, false
            http.deletePipe(id).then((isSuccess) => {
                if (isSuccess === 'cancel') {
                    return
                } else if (isSuccess) {
                    if (appModel.isDebug && appModel.isCompleted) {
                        window.location = '/pipeline/debug/completed'
                    } else if(appModel.isDebug && !appModel.isCompleted) {
                        window.location = '/pipeline/debug/running'
                    }else if(appModel.isCompleted){
                        window.location = '/pipeline/completed'
                    }else{
                        window.location = '/pipeline/running'
                    }
                }
            })
        })
        // Pause Pipe
        $(this.view.html.refs['btn-pause-pipe']).on('click', () => {
            http.pausePipe({
                'pipeId': this.appData.id
            }).then((isSuccess) => {
                if (isSuccess) {
                    $(this.view.html.refs['btn-play-pipe']).prop('disabled', false)
                    $(this.view.html.refs['btn-pause-pipe']).prop('disabled', true)
                    $(this.graph.svg.refs['title']).show()
                }
            })
        })
        // Play Pipe
        $(this.view.html.refs['btn-play-pipe']).on('click', () => {
            http.playPipe({
                'pipeId': this.appData.id
            }).then((isSuccess) => {
                if (isSuccess) {
                    $(this.view.html.refs['btn-play-pipe']).prop('disabled', true)
                    $(this.view.html.refs['btn-pause-pipe']).prop('disabled', false)
                    $(this.graph.svg.refs['title']).hide()
                }
            })

        })
        // Download Logfile
        $(this.view.html.refs['btn-download-logfile']).on('click', () => {
            if (this.appData.logfilePath) {
                window.location = window.location.origin + '/' + this.appData.logfilePath
            } else {
                swal({
                    type: 'error',
                    title: 'Oops...',
                    text: 'Logfile does not exist',
                })
            }
        })
        // Toggle Infobox
        $(this.view.html.refs['btn-toggle-infobox']).on('click', () => {
            console.log('==================this.graph.svg.refs==================')
            console.log(this.graph.svg.refs)
            console.log('====================================')
            $(this.graph.svg.refs['title']).slideToggle('slow')
            $(this.view.html.refs['btn-toggle-infobox-icon']).toggleClass('fa-toggle-on fa-toggle-off')
        })

        // MODEL-BINDING
        appModel.state.selectedPipe.on('update', (data) => this.loadTemplate(data))
    }
    loadTemplate(appData: any){
        // the appData reference is used in the toolbar view bindings (see constructor).
        this.appData = appData
        
        // the graph must be initialized after switching tabs. 
        // the svg gets resized to its target container. 
        // if the container is displayed=none, it has no width.
        // the graph wont render well this way.
        this.show()

        // create / re-create the graph
        if(this.graph){
            this.graph.remove()
        } 
        this.graph = new Graph(this.view.html.refs['dagre'])

        // @model-binding: should this be updated automatically ?
        if(appModel.isCompleted) {
            $(this.view.html.refs['btn-pause-pipeline']).remove()
        }

        // @refactor: somehow ?
        console.log('ADDED')
        $(this.graph.svg.refs['title']).append(`
            <table class='table table-borderless'>
                <h3 style='text-align: center'><span class='label label-warning'>PAUSED</span></h3>
                <tbody>
                    <tr><td>Name:</td><td>${appData.name}</td></tr> 
                    <tr><td>Author:</td><td>${appData.userName}</td></tr> 
                    <tr><td>Id:</td><td>${appData.id}</td></tr> 
                    <tr><td>Date:</td><td>${new Date(appData.timestamp)}</td></tr>             
                    <tr><td>Description:</td><td>${appData.description}</td></tr> 
                </tbody>  
            </table>
        `)

        // handle pipeline progress information.
        if (appData.progress === 'PAUSED') {
            $(this.graph.svg.refs['title']).show()
            $(this.view.html.refs['btn-play-pipe']).prop('disabled', false)
            $(this.view.html.refs['btn-pause-pipe']).prop('disabled', true)
        } else {
            $(this.graph.svg.refs['title']).hide()
            $(this.view.html.refs['btn-play-pipe']).prop('disabled', true)
            $(this.view.html.refs['btn-pause-pipe']).prop('disabled', false)
        }

        if(appModel.isCompleted){
            $(this.view.html.refs['btn-play-pipe']).prop('disabled', true)
            $(this.view.html.refs['btn-pause-pipe']).prop('disabled', true)
        }

        // create nodes from data.
        const mode = 'running'
        this.nodes = new Map()
        appData.elements.forEach(nodeData => {
            if ('datasource' in nodeData) {
                this.nodes.set(nodeData.id, new DatasourceNodePresenter(this.graph, nodeData, mode))
            } else if ('script' in nodeData) {
                this.nodes.set(nodeData.id, new ScriptNodePresenter(this.graph, nodeData, mode))
            } else if ('annoTask' in nodeData) {
                this.nodes.set(nodeData.id, new AnnoTaskNodePresenter(this.graph, nodeData, mode))
            } else if ('dataExport' in nodeData) {
                this.nodes.set(nodeData.id, new DataExportNodePresenter(this.graph, nodeData, mode))
            } else if ('visualOutput' in nodeData) {
                this.nodes.set(nodeData.id, new VisualOutputNodePresenter(this.graph, nodeData, mode))
            } else if ('loop' in nodeData) {
                this.nodes.set(nodeData.id, new LoopNodePresenter(this.graph, nodeData, mode))
            }
        })

        // add nodes and edges to the graph.
        this.nodes.forEach(n => this.graph.addNode(n))
        this.nodes.forEach(n => {
            if (n.constructor.name === 'LoopNodePresenter') {
                this.graph.addEdge(n.model.peN, n.model.loop.peJumpId, true)
            }
            n.model.peOut.forEach(e => {
                this.graph.addEdge(n.model.peN, e)
            })
        })

        this.graph.centerGraph()

        // enable tooltips after drawing all nodes.
        $(`[data-toggle='tooltip']`).tooltip({
            html: true,
            placement: 'right',
            container: 'body'
        })

        // update polling.
        if(!appModel.isCompleted){
            let refresh = setInterval(() => {
                $(this.view.html.refs['update-label']).fadeIn(200)
                 http.requestPipeline(this.appData.id)
                 .then((appData) => {
                    // tooltip would stay opened, if we wouldn't hide it on update.
                    $('.tooltip').tooltip('hide')                  
                    if(typeof appData === 'string'){
                        clearInterval(refresh)
                        swal({
                            type: 'success',
                            title: 'Pipeline finished',
                            text: 'Go to Finished Pipes Tab',
                        })
                        $(this.view.html.refs['update-label']).delay(500).fadeOut(200)
                        return
                    }
                    // update the model of each graph node.
                    appData.elements.forEach(nodeData => {
                        const node = this.nodes.get(nodeData.id)
                        node.model.state.update(nodeData.state)
                        switch(node.__proto__.constructor.name){
                            case 'AnnoTaskNodePresenter':
                                node.model.progress.update(nodeData.annoTask.progress ? nodeData.annoTask.progress : 0)
                                break
                            case 'ScriptNodePresenter':
                                node.model.progress.update(nodeData.script.progress ? nodeData.script.progress : 0)
                                node.model.errorMsg.update(nodeData.script.errorMsg ? nodeData.script.errorMsg : '')
                                break
                        }
                    })
                    // not thefinest solution add event Listenet Modal on close
                    $(`[data-toggle='tooltip']`).tooltip({
                        html: true,
                        placement: 'right',
                        container: 'body'
                    })
                    $(this.view.html.refs['update-label']).delay(500).fadeOut(200)
                }).catch((error) => {
                    clearInterval(refresh)
                })
            }, 1000)
        }
    }
    validate() {
        super.validate(() => {
            return true
        })
    }
    deactivate() {
        super.deactivate(() => {
            // destroy graph (remove Modals)
        })
    }
}
export default new PipelineGraphPresenter()