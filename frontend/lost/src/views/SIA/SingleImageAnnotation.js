import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import * as appView from '../../tools/sia/src/appView'
import * as controlsView from '../../tools/sia/src/components/controls/controlsView'

import LabelSelect from '../../components/LabelSelect/LabelSelect'

export default class SingleImageAnnotation extends Component {
	constructor(props){
		super(props)
		this.mount = React.createRef()
	}
	componentDidMount(){
		require('../../tools/sia/src/appPresenter')
		this.mount.current.appendChild(appView.html.fragment)
		this.mount.current.appendChild(controlsView.html.fragment)
		// ReactDOM.render(<LabelSelect/>, document.getElementById('sia-propview-label-select-mountpoint'))
	}
	render(){
		return (
			<div ref={this.mount} id='sia-mount'></div>
		)
	}
}