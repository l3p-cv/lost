import React from "react"
import { Component } from "react"

import "./LabelSelect.scss"

export default class LabelSelect extends Component {
	constructor(props){
		super(props)
		this.state = []
	}
	render(){
		return (
			<div className="btn-group" id="sia-propview-label-select">
                <button className="btn btn-default">
                    <span className="selected-label pull-left" id="sia-propview-label-select-text">
						wakaterimashta
					</span>
                </button>
                <div className="">
                    <div className="">
                        <input className="form-control" type="text" />
                    </div>
					<ul className="dropdown-menu">

                    </ul>
                </div>
            </div>
		)
	}
}