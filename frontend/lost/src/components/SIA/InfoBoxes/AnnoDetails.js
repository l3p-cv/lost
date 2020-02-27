import React, {Component} from 'react'
import {connect} from 'react-redux'
import { Card, Icon, Statistic, Divider } from 'semantic-ui-react'
import InfoBox from './InfoBox'
import actions from '../../../actions'
import * as transform from '../lost-sia/src/utils/transform'
const { siaShowImgBar } = actions

class AnnoDetails extends Component{

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
        if (this.props.anno.id){
            let box = transform.getBox(this.props.anno.data, this.props.anno.type)
            if (!box[1]) return "No annotation selected!"
            box = transform.toBackend(box, this.props.svg, 'bBox')
            console.log('AnnoDetails box', box)
            return (
                <div>
                <Statistic.Group widths='one' size='mini'>
                    <Statistic>
                        <Statistic.Label> 
                            x / y
                        {/* <Icon name="arrow right"/> */}
                        </Statistic.Label>
                        <Statistic.Value>
                            {/* {"x / y"} */}
                            {/* <Icon name="arrow right"/> */}

                            {"("+box.x.toFixed(2)+" , "+ box.y.toFixed(2)+")"}
                        </Statistic.Value>
                    </Statistic>
                </Statistic.Group>
                <Divider horizontal> Size </Divider>
                <Statistic.Group widths='two' size='mini'>
                    <Statistic >
                        <Statistic.Value>
                            {Math.abs(box.w).toFixed(2)}
                        </Statistic.Value>
                        <Statistic.Label>
                            <Icon name="arrows alternate horizontal"/>
                            width
                        </Statistic.Label>
                    </Statistic>
                    <Statistic>
                        <Statistic.Value>
                            {Math.abs(box.h).toFixed(2)}
                        </Statistic.Value>
                        <Statistic.Label>
                            <Icon name="arrows alternate vertical"/>
                            height
                        </Statistic.Label>
                    </Statistic>
                </Statistic.Group>
                </div>
            )
        } else {
            return "No annotation selected!"
        }
    }

    
    render(){
        return <InfoBox
            header={"Annotation ID: "+this.props.anno.id}
            content={this.renderDescription()}
            visible={this.props.visible}
            defaultPos={this.props.defaultPos}
            onDismiss={e => this.onDismiss()}
        />
    }
}

function mapStateToProps(state) {
    return ({
        annos: state.sia.annos,
        layoutUpdate: state.sia.layoutUpdate,
        uiConfig: state.sia.uiConfig,
        imgBar: state.sia.imgBar
    })
}
export default connect(mapStateToProps, 
    {siaShowImgBar}
)(AnnoDetails)