import React, {Component} from 'react'
import { Icon, Dropdown, Menu, Input, Message, Statistic, Divider, Button, List, Label, Header } from 'semantic-ui-react'
import LabelInput from './LabelInput'

class ImgBar extends Component{

    constructor(props) {
        super(props)
        this.state = {
            position: {
                top: 0,
                left: 0,
            }
        }
    }

    componentDidMount(){
        
    }
    componentDidUpdate(prevProps){

        if (this.props.svg !== prevProps.svg){
            this.setState({
                position: {...this.state.position,
                left: this.props.svg.left,
                top: this.props.svg.top,
                }
            })
        }
    }

    /*********
     * Events
     *********/
    handleLabelUpdate(label){
        console.log('ImgBar label update', label)
        if (this.props.onLabelUpdate){
            this.props.onLabelUpdate(label)
        }
    }
    
    handleClose(){
        if (this.props.onClose){
            this.props.onClose()
        }
    }

    render(){
        if (!this.props.visible) return null
        if (!this.props.annos.image) return null
        const activeItem='home'
        return(
        <div style={{
            position:'fixed', 
            top: this.state.position.top, 
            left:this.state.position.left,
            }}>
                {/* <div className="handle" style={{cursor: 'grab'}}>Drag</div> */}
            <Menu inverted>
                <Menu.Item  
                active={activeItem === 'bla'} 
                >
                {this.props.annos.image.number +" / "+ this.props.annos.image.amount}
                </Menu.Item>
                <Menu.Item
                active={activeItem === 'messages'}
                >
                {this.props.annos.image.url.split('/').pop() +" (ID: "+this.props.annos.image.id+")"}
                </Menu.Item>
                <Menu.Menu position='right'>
                <Menu.Item style={{padding: "5px"}}>
                    <LabelInput
                        relatedId={this.props.annos.image.id}
                        visible={true}
                        onLabelUpdate={label => this.handleLabelUpdate(label)}
                        possibleLabels={this.props.possibleLabels}
                        initLabelIds={this.props.annos.image.labelIds}
                        relatedId={this.props.annos.image.id}
                        />
                </Menu.Item>
                <Menu.Item
                    active={activeItem === 'logout'}
                    onClick={() => this.handleClose()}
                >
                <Icon inverted size="small" name="close"></Icon>
                </Menu.Item>
                </Menu.Menu>
            </Menu>
            {/* <Fade in={this.props.imgBar.show}> 
            <Card style={{minWidth:"600px"}} >
            <CardBody>
                <Row>
                    <Col xs='5' sm='5' lg='5'>
                        <Input></Input>
                    </Col>
                    <Col xs='2' sm='2' lg='2'>
                    <FontAwesomeIcon icon={faArrowRight} /> {this.props.annos.image.number} / {this.props.annos.image.amount}
                    </Col>
                    <Col xs='4' sm='4' lg='4'>
                         {this.props.annos.image.url.split('/').pop()} (ID: {this.props.annos.image.id})
                    </Col>
                    <Col xs='1' sm='1' lg='1'>
                         <Button close onClick={() => this.props.siaShowImgBar(false)} />
                    </Col>
                </Row>
                </CardBody>
            </Card>
            </Fade> */}
        </div>
        )
    }
}

export default ImgBar