import React, {Component} from 'react'
import {Tooltip} from 'reactstrap'

class ToolbarTooltip extends Component{
    constructor(){
        super()
        this.toggle = this.toggle.bind(this);
        this.state = {
            tooltipOpen: false
        }
    }
    toggle() {
        this.setState({
          tooltipOpen: !this.state.tooltipOpen
        });
      }
      render() {
        return (
          <div>
            <Tooltip delay={{show:0,hide:0}} placement="bottom" isOpen={this.state.tooltipOpen} target={this.props.target} toggle={this.toggle}>
              {this.props.text}
            </Tooltip>
          </div>
        );
      }
}

export default ToolbarTooltip