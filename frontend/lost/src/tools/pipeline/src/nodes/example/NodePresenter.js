import BaseNodePresenter from '../BaseNodePresenter'
import NodeModel from './NodeModel'

import StartView from './views/StartView'
import RunningView from './views/RunningView'
import CreateView from './views/CreateView'

import StartModal from './modals/StartModal'
import RunningModal from './modals/RunningModal'
import CreateModal from './modals/CreateModal'


export default class ExampleNodePresenter extends BaseNodePresenter {

    /**
     * @param {*} data Specific data to fill the Graph-Node with.
     */
    constructor(graph, data) {
        super(graph)

        // create model
        this.model = new NodeModel(data)

        // create view
        switch(data.type){
            case 'start':
                this.view = new StartView(this.model)
                break
            case 'running':
                this.view = new RunningView(this.model)
                break
            case 'create':
                this.view = new CreateView(this.model)
                break
            default: throw new Error(`no node view available for ${data.type}`)
        }

        // create modal
        switch(data.type){
            case 'start':
                this.modal = new StartModal(this.model)
                break
            case 'running':
                this.modal = new RunningModal(this.model)
                break
            case 'create':
                this.modal = new CreateModal(this.model)
                break
            default: throw new Error(`no node modal available for ${data.type}`)
        }
    }


    /**
     * @override
     */
    initViewBinding(){
        $(this.view.parentNode).on('mouseover', `[data-ref='title']`, (e) => {
            this.model.text.update('it works!')
        })
    }

    /**
     * @override
     */
    initModelBinding(){
        this.model.text.on('update', (text) => this.view.setInfoText(text))
        this.model.text.on('update', (text) => this.modal.setInfoText(text))
    }
}