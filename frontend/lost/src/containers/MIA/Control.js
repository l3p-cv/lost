import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'
import Autocomplete from 'react-autocomplete'
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

const {miaZoomIn, miaZoomOut, miaAmount, getMiaAnnos, getMiaLabel} = actions

class Control extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dropdownOpen: false,
            value: ''
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
        this.handleZoomIn = this
            .handleZoomIn
            .bind(this)
        this.handleZoomOut = this
            .handleZoomOut
            .bind(this)
        this.handleMaxAmount = this
            .handleMaxAmount
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

    handleZoomIn(){
        this.props.miaZoomIn(this.props.zoom)
    }

    handleZoomOut(){
        this.props.miaZoomOut(this.props.zoom)
    }

    handleMaxAmount(e){
        this.props.miaAmount(e.target.innerText)
        this.props.getMiaAnnos(e.target.innerText)
    }
    componentDidMount(){
        this.props.getMiaLabel()
    }
     render() {
         console.log(this.props)
        return (
            <Row style={{
                padding: '0 0 25px 0'
            }}>
                <Col xs='5' sm='5' lg='5'>
                    <InputGroup>
                        <Autocomplete
                            items={this.props.labels}
                            shouldItemRender={(item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
                            getItemValue={item => item.label}
                            renderInput={(props) => {return <input {...props} className='form-control'/>}} 
                            renderItem={(item, highlighted) =>
                            <div
                                key={item.id}
                                style={{ backgroundColor: highlighted ? '#eee' : 'transparent'}}
                            >
                                {item.label}
                            </div>
                            }
                            value={this.state.value}
                            onChange={e => this.setState({ value: e.target.value })}
                            onSelect={value => this.setState({ value })}
                        />
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
    return ({zoom: state.mia.zoom, labels: state.mia.labels})
}

export default connect(mapStateToProps, {miaZoomIn, miaZoomOut, miaAmount, getMiaAnnos, getMiaLabel})(Control)