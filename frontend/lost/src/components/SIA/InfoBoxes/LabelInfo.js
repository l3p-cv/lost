import React, {Component} from 'react'
import { Card, Header } from 'semantic-ui-react'
import InfoBox from './InfoBox'

class LabelInfo extends Component{

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

    onDismiss(){
        if (this.props.onDismiss){
            this.props.onDismiss()
        }
    }
    renderDescription(){
        if (this.props.selectedLabelIds){
            const lbl = this.props.possibleLabels.find( e => {
                return this.props.selectedLabelIds[0] === e.id
            })
            if (!lbl) return "No Label"
            return <div>
                <Header>{
                    lbl.label
                }</Header>
                {lbl.description}
            </div>
        }
    }

    
    render(){
        return <InfoBox
            header="Label Info"
            content={this.renderDescription()}
            visible={this.props.visible}
            defaultPos={this.props.defaultPos}
            onDismiss={() => this.onDismiss()}
        />
    }
}


export default LabelInfo