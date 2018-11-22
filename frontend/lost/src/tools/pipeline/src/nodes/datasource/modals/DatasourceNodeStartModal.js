import { BaseModal } from 'pipRoot/l3pfrontend/index'


const attributeMap = new Map([
	['rawFile', {
		title: 'Datasource Typ Raw File',
		content: /*html*/`
			<div class='form-group'>
				<p data-ref='available'>Path is not avaiable<p>
				<label>Search in Path:</label>
				<input data-ref='path-input' type='text' class='form-control'>
			</div>
		`
	}],
	['labelTree', {
		title: 'Select Label Tree',
		content: /*html*/`
		`
	}],
	['pipeElement', {
		title: 'Select Pipeline',
		content: /*html*/`
		`
	}],
])

export default class DatasourceStartModal extends BaseModal {
    constructor(node: DatasoureNodePresenter){
		// init modal html
		super(attributeMap.get(node.model.datasource.type))
		console.log({datasource: node.model.state.datasource})

        // add bindings
        switch(node.model.datasource.type){
            case 'rawFile':
                $(this.html.refs['path-input']).on('input', ($event) => {
                    for(let path of node.model.datasource.availableRawFiles){
                        if(path === $($event.currentTarget).val()){
                            $(this.html.refs['available']).text('Path is avaiable')                            
                            node.model.state.path.update(path)
                            node.model.state.validated.update(true)
                            break
                        } else {
                            $(this.html.refs['available']).text('Path is not avaiable')
                            node.model.state.path.update('') // reset?
							node.model.state.validated.update(false)
                        }
                    }
                })
                break
			case 'labelTree':
				throw new Error('Not implemented.')
            case 'pipeElement':
				throw new Error('Not implemented.')
			default:
        }
    }
}