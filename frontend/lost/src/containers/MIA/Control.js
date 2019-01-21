import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'
import {
    Col,
    Row,
    Input,
    InputGroup,
    InputGroupAddon,
    Button,
    ButtonGroup,
    ButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from 'reactstrap'

class Control extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dropdownOpen: false,
            labelName: ''
        }

        this.handleLabelName = this
            .handleLabelName
            .bind(this)
        this.handleAddLabel = this
            .handleAddLabel
            .bind(this)
        this.toggle = this
            .toggle
            .bind(this)
    }
    toggle(){
        this.setState({dropdownOpen:!this.state.dropdownOpen})
    }
    handleAddLabel(e){
        console.log(e)
    }

    handleLabelName(e){
        console.log(e)
    }
     render() {
        return (
            <Row style={{
                padding: '0 0 10px 0'
            }}>
                <Col xs='5' sm='5' lg='5'>
                    <InputGroup>
                        <Input
                            placeholder="label name"
                            value={this.state.labelName}
                            onChange={this.handleLabelName}></Input>
                        <InputGroupAddon addonType="append">
                            <Button className='btn-default' onClick={this.handleAddLabel}><i className="fa fa-plus"></i><br /></Button>
                        </InputGroupAddon>
                    </InputGroup>
                </Col>
                <Col xs='3' sm='3' lg='3'>
                <Button className='btn-info' onClick={this.handleAddLabel}><i className="fa fa-check"></i> Submit</Button>
                </Col>
                <Col xs='4' sm='4' lg='4'>
                    <ButtonGroup className="float-right"> 
                            <Button className='btn-default' onClick={this.handleAddLabel}><i className="fa fa-search-plus"></i></Button>
                            <Button className='btn-default' onClick={this.handleAddLabel}><i className="fa fa-search-minus"></i></Button>
                            <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                            <DropdownToggle caret>
                                Amount
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem>1</DropdownItem>
                                <DropdownItem>5</DropdownItem>
                                <DropdownItem>10</DropdownItem>
                                <DropdownItem>20</DropdownItem>
                                <DropdownItem>50</DropdownItem>
                                <DropdownItem>100</DropdownItem>
                                <DropdownItem>150</DropdownItem>
                                <DropdownItem>200</DropdownItem>
                            </DropdownMenu>
                            </ButtonDropdown>
                    </ButtonGroup>
                </Col>
            </Row>
        )
    }
}

function mapStateToProps(state) {
    return ({createMessage: state.group.createMessage})
}

export default connect(mapStateToProps, )(Control)