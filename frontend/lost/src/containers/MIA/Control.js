import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'
import Autocomplete from 'react-autocomplete'
import {
    Col,
    Row,
    InputGroup,
    Button,
    ButtonGroup,
    ButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from 'reactstrap'

import './Tag.scss';

const {miaZoomIn, miaZoomOut, miaAmount, getMiaAnnos, getMiaLabel, getWorkingOnAnnoTask, setMiaSelectedLabel, updateMia} = actions

class Control extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dropdownOpen: false,
            value: '',
            loading: true
        }

        this.handleAddLabel = this
            .handleAddLabel
            .bind(this)
        this.toggle = this
            .toggle
            .bind(this)
        this.handleZoomIn = this
            .handleZoomIn
            .bind(this)
        this.handleZoomOut = this
            .handleZoomOut
            .bind(this)
        this.handleMaxAmount = this
            .handleMaxAmount
            .bind(this)
        this.handleSubmit = this
            .handleSubmit
            .bind(this)
    }
    toggle(){
        this.setState({dropdownOpen:!this.state.dropdownOpen})
    }

    handleAddLabel(label){
        this.props.setMiaSelectedLabel(label)
    }

    handleSubmit(){
        const updateData = {
            images: this.props.images,
            labels: [this.props.selectedLabel]
        }
        this.props.updateMia(updateData, this.props.getMiaAnnos, this.props.getWorkingOnAnnoTask, this.props.maxAmount)
        this.props.setMiaSelectedLabel(undefined)
        this.setState({value:''})

    }

    handleZoomIn(){
        this.props.miaZoomIn(this.props.zoom)
    }

    handleZoomOut(){
        this.props.miaZoomOut(this.props.zoom)
    }

    handleMaxAmount(e){
        this.props.miaAmount(e.target.innerText)
        this.props.getMiaAnnos(e.target.innerText)
        this.props.setMiaSelectedLabel(undefined)
    }
    componentDidMount(){
        this.props.getMiaLabel()
        this.props.setMiaSelectedLabel(undefined)
    }
    renderSelectedLabel(){
        if(this.props.selectedLabel){
            return(
                <div className="mia-tag"> 
                <div>{this.props.selectedLabel.label}</div>
            </div>
            )
        }
    }
     render() {
        return (
            <Row style={{
                padding: '0 0 25px 0'
            }}>
                <Col xs='7' sm='7' lg='7'>
                    <InputGroup>
                        <Autocomplete
                            items={this.props.labels}
                            shouldItemRender={(item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
                            getItemValue={item => item.label}
                            renderInput={(props) => {return <input {...props} style={{width: '300px'}} className='form-control'/>}} 
                            renderItem={(item, highlighted) =>
                            <div
                                className={`item ${highlighted ? 'item-highlighted' : ''}`}
                                key={item.id}
                            >
                                {item.label}
                            </div>
                            }
                            value={this.state.value}
                            onChange={e => this.setState({ value: e.target.value })}
                            onSelect={(value, label) => {this.setState({ value: value });this.handleAddLabel(label)}}
                        />
                    
                    {this.renderSelectedLabel()}
                    </InputGroup>
                </Col>
                <Col xs='2' sm='2' lg='2'>
                <Button disabled={this.props.selectedLabel ? false:true} className='btn-info' onClick={this.handleSubmit}><i className="fa fa-check"></i> Submit</Button>
                </Col>
                <Col xs='3' sm='3' lg='3'>
                    <ButtonGroup className="float-right"> 
                            <Button className='btn-default' onClick={this.handleZoomIn}><i className="fa fa-search-plus"></i></Button>
                            <Button className='btn-default' onClick={this.handleZoomOut}><i className="fa fa-search-minus"></i></Button>
                            <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                            <DropdownToggle caret>
                                Amount
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={this.handleMaxAmount}>1</DropdownItem>
                                <DropdownItem onClick={this.handleMaxAmount}>5</DropdownItem>
                                <DropdownItem onClick={this.handleMaxAmount}>10</DropdownItem>
                                <DropdownItem onClick={this.handleMaxAmount}>20</DropdownItem>
                                <DropdownItem onClick={this.handleMaxAmount}>50</DropdownItem>
                                <DropdownItem onClick={this.handleMaxAmount}>100</DropdownItem>
                                <DropdownItem onClick={this.handleMaxAmount}>150</DropdownItem>
                                <DropdownItem onClick={this.handleMaxAmount}>200</DropdownItem>
                            </DropdownMenu>
                            </ButtonDropdown>
                    </ButtonGroup>
                </Col>
            </Row>
        )
    }
}

function mapStateToProps(state) {
    return ({zoom: state.mia.zoom, maxAmount: state.mia.maxAmount, labels: state.mia.labels, selectedLabel: state.mia.selectedLabel, images: state.mia.images})
}

export default connect(mapStateToProps, {miaZoomIn, miaZoomOut, miaAmount, getMiaAnnos, getMiaLabel, getWorkingOnAnnoTask, setMiaSelectedLabel, updateMia})(Control)