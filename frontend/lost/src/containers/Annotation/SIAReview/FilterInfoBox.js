import React, {Component} from 'react'
import { Card, Dropdown } from 'semantic-ui-react'
import _ from 'lodash'
import InfoBox from '../SIA/lost-sia/src/InfoBoxes/InfoBox'

const getOptions = (number, prefix = 'Iteration ') =>
  _.times(number, (index) => ({
    key: index,
    text: `${prefix}${index}`,
    value: index,
  }))

class FilterInfoBox extends Component{

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount(){
        
    }
    componentDidUpdate(prevProps){

    }

    renderMeta(){
        if (this.props.anno.id){
            return (
                <Card.Meta>Type: {this.props.anno.type} </Card.Meta>
            )
        }
    }

     /*********
     * Events
     *********/
    handleIterationChange(e, item){
        console.log('Iteration Changed', e, item)
        if (this.props.onIterationChange){
            this.props.onIterationChange(item.value)
        }
    }

    onDismiss(){
        if (this.props.onDismiss){
            this.props.onDismiss()
        }
    }

    renderDescription(){
        return <Dropdown 
            // text='Filter iteration'
            placeholder='Filter iteration'
            icon='filter' 
            floating
            search  
            selection
            options={getOptions(this.props.options.max_iteration + 1)} 
            onChange={(e, item) => this.handleIterationChange(e, item)}
        />
    }

    
    render(){
        return <InfoBox
            header="Filter Info"
            content={this.renderDescription()}
            visible={this.props.visible}
            defaultPos={this.props.defaultPos}
            onDismiss={() => this.onDismiss()}
        />
    }
}


export default FilterInfoBox