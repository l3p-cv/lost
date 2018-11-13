import { BaseModal } from 'pipRoot/l3pfrontend/index'
import paramsRawFiles from './types/availableRawFiles'
import paramsModelTree from './types/availableModelTrees'
import paramsDatasets from './types/availableDatasets'
import paramsPipeElement from './types/pipeElement'
import DatasourceStartView from '../views/DatasourceStartView'
import 'datatables.net'
import 'datatables.net-buttons'


export default class DatasourceStartModal extends BaseModal {
    constructor(presenter) {
        let nodeModel = presenter.model
        let params = undefined
        // set modal params
        switch (nodeModel.datasource.type) {
            case 'dataset':
                params = paramsDatasets
                break
            case 'modelLeaf':
                params = paramsModelTree
                break
            case 'rawFile':
                params = paramsRawFiles
                break
            case 'pipeElement':
                params = paramsPipeElement
                break
            default:
                throw new Error('invalid datasourcce type.')
        }
        super(params)

        // init modal params
        switch (nodeModel.datasource.type) {
            case 'dataset':
                let dataTableAvailableDatasets= $(this.view.refs['table-dataset']).DataTable({
                    lengthMenu: [
                        [3, 10, 20, 50, -1],
                        [3, 10, 20, 50, 'All'],
                    ],
                    data: nodeModel.datasource.availableDatasets,
                    columns: [{
                            data: 'name',
                            title: 'Name',
                        },
                        {
                            data: 'id',
                            title: 'Id',
                        },
                        {
                            data: 'description',
                            title: 'Description',
                        },
                        {
                            data: 'userName',
                            title: 'User Name',
                        },
                        {
                            data: 'timestamp',
                            title: 'Time',
                        },
                    ]
                })
                $(this.view.refs['table-dataset']).find('tbody').on('click', 'tr', (e) => {
                    dataTableAvailableDatasets.$('tr.selected').removeClass('selected')
                    $(e.currentTarget).addClass('selected')
                    let datasetId = parseInt($(e.currentTarget.childNodes[1]).text())
                    if(isNaN(datasetId)){
                        throw new Error('Error DatasetId is NaN')
                    }else{
                        nodeModel.post.datasource.datasetId = datasetId                        
                    }
                    presenter.view = new DatasourceStartView(nodeModel)                      
                })
                break
            case 'modelLeaf':
                let dataTableAvailableModelTrees = $(this.view.refs['table-model-trees']).DataTable({
                    lengthMenu: [
                        [3, 5],
                        [3, 5],
                    ],
                    data: nodeModel.datasource.availableModelTrees,
                    columns: [
                        {
                            data: 'name',
                            title: 'Name',
                        },
                        {
                            data: 'id',
                            title: 'Id',
                        },
                        {
                            data: 'description',
                            title: 'Description',
                        },
                        {
                            data: 'userName',
                            title: 'User Name',
                        },
                        {
                            data: 'timestamp',
                            title: 'Time',
                        },
                    ]
                })
                let selectedTree = ''
                $(this.view.refs['div-dropdown']).hide()
                $(this.view.refs['table-model-trees']).find('tbody').on('click', 'tr', (e) => {
                    nodeModel.post.datasource.modelLeafId = undefined                    
                    dataTableAvailableModelTrees.$('tr.selected').removeClass('selected')
                    $(e.currentTarget).addClass('selected')
                    nodeModel.datasource.availableModelTrees.forEach(element => {
                        if (element.id === $(e.currentTarget.childNodes[1]).text()) {
                            $(this.view.refs['div-dropdown']).show()
                            $(this.view.refs['leave-information']).empty()
                            selectedTree = element
                            $(this.view.refs['dropdown']).empty()
                            for (var index = 0; index < element.modelLeaves.length; index++) {
                                $(this.view.refs['dropdown']).append(`<li><a data-index='${index}'>${element.modelLeaves[index].name}</a></li>`)
                            }
                        }
                    })
                    presenter.view = new DatasourceStartView(nodeModel)                      
                })
                $(this.view.refs['dropdown']).on('click', 'li a', (e) => {
                    $(this.view.refs['leave-information']).empty()
                    let j = e.currentTarget.getAttribute('data-index')
                    $(this.view.refs['leave-information']).append(
                        `                        
                            <tr><td><strong>Name</td><td> ${selectedTree.modelLeaves[j].name}</td></tr>                                        
                            <tr><td><strong>Id</td><td> ${selectedTree.modelLeaves[j].id}</td></tr>                                        
                            <tr><td><strong>Architecture</td><td> ${selectedTree.modelLeaves[j].architecture}</td></tr>   
                            <tr><td><strong>Description</td><td> ${selectedTree.modelLeaves[j].description}</td></tr>                
                            <tr><td><strong>Framework</td><td> ${selectedTree.modelLeaves[j].framework}</td></tr>                
                            <tr><td><strong>initialTrainedBy</td><td> ${selectedTree.modelLeaves[j].initialTrainedBy}</td></tr>                
                            <tr><td><strong>isMaster</td><td> ${selectedTree.modelLeaves[j].isMaster}</td></tr> 
                            <tr><td><strong>parentId</td><td> ${selectedTree.modelLeaves[j].parentId}</td></tr>
                            <tr><td><strong>timestamp</td><td> ${selectedTree.modelLeaves[j].timestamp}</td></tr>
                            <tr><td><strong>userName</td><td> ${selectedTree.modelLeaves[j].userName}</td></tr>
                       `
                    )
                    nodeModel.post.datasource.modelLeafId = selectedTree.modelLeaves[j].id
                    presenter.view = new DatasourceStartView(nodeModel)  
                })
                break
            case 'rawFile':
                $(this.view.refs['inputAvailableRawFiles']).on('input', (e) => {
                    for(let n of nodeModel.datasource.availableRawFiles){
                        if(n === $(e.currentTarget).val()){
                            $(this.view.refs['pathAvaiable']).text('Path is avaiable')                            
                            nodeModel.post.datasource.rawFilePath = n
                            break
                        }else{
                            $(this.view.refs['pathAvaiable']).text('Path is not avaiable')
                            nodeModel.post.datasource.rawFilePath = undefined
                        }
                    }
                    presenter.view = new DatasourceStartView(nodeModel)                    
                })
                break
            case 'pipeElement':
                $(this.view.refs['inputPipeElement']).on('input', (e) => {
                    if(isNaN(parseInt($(e.currentTarget).val())) && $(e.currentTarget).val() !== ''){
                        alert('please enter an Integer')
                        $(this.view.refs['inputPipeElement']).val('')                        
                    }else{
                        nodeModel.post.datasource.pipeElementId = parseInt($(e.currentTarget).val())
                    }
                    presenter.view = new DatasourceStartView(nodeModel)  
                })
                break
        }
    }
}