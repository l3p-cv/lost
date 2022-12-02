import React, { Component } from 'react'
import { connect } from 'react-redux'
import actions from '../../../actions'
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
    DropdownItem,
} from 'reactstrap'
import { Icon, Label } from 'semantic-ui-react'

import './Tag.scss'
import UndoRedo from '../../../libs/hist'

const {
    refreshToken,
    miaZoomIn,
    miaZoomOut,
    miaAmount,
    getMiaAnnos,
    getSpecialMiaAnnos,
    getMiaLabel,
    miaToggleActive,
    getWorkingOnAnnoTask,
    setMiaSelectedLabel,
    updateMia,
} = actions

class Control extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dropdownOpen: false,
            value: '',
            loading: true,
        }

        this.handleAddLabel = this.handleAddLabel.bind(this)
        this.toggle = this.toggle.bind(this)
        this.handleZoomIn = this.handleZoomIn.bind(this)
        this.handleZoomOut = this.handleZoomOut.bind(this)
        this.handleMaxAmount = this.handleMaxAmount.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleReverse = this.handleReverse.bind(this)
        this.handleUndo = this.handleUndo.bind(this)

        this.hist = new UndoRedo()
    }
    toggle() {
        this.setState({ dropdownOpen: !this.state.dropdownOpen })
    }
    handleReverse() {
        this.props.images.map((image) => {
            this.props.miaToggleActive({
                image: { ...image, is_active: !image.is_active },
            })
            return undefined
        })
    }
    handleAddLabel(label) {
        this.props.setMiaSelectedLabel(label)
    }

    handleSubmit() {
        const updateData = {
            images: [...this.props.images],
            labels: [{ ...this.props.selectedLabel }],
        }
        this.hist.push(updateData, 'next')
        this.props.updateMia(
            updateData,
            this.props.getMiaAnnos,
            this.props.getWorkingOnAnnoTask,
            this.props.maxAmount,
        )
        this.props.setMiaSelectedLabel(undefined)
        this.setState({ value: '' })
    }

    handleZoomIn() {
        this.props.miaZoomIn(this.props.zoom)
    }

    handleZoomOut() {
        this.props.miaZoomOut(this.props.zoom)
    }

    handleMaxAmount(e) {
        this.props.miaAmount(e.target.innerText)
        this.props.getMiaAnnos(e.target.innerText)
        this.props.setMiaSelectedLabel(undefined)
    }

    handleUndo() {
        if (!this.hist.isEmpty()) {
            const cState = this.hist.undoMia()

            const miaIds = {
                miaIds: cState.entry.images.map((image) => {
                    return image.id
                }),
            }
            this.props.getSpecialMiaAnnos(miaIds, this.props.getWorkingOnAnnoTask)
        }
    }

    componentDidMount() {
        this.props.getMiaLabel()
        this.props.setMiaSelectedLabel(undefined)
    }

    componentDidUpdate() {
        if (!this.props.selectedLabel) {
            if (this.props.proposedLabel) {
                this.handleAddLabel(
                    this.props.labels.find(
                        (value) => value.id === this.props.proposedLabel,
                    ),
                )
            }
        }
    }
    renderSelectedLabel() {
        if (this.props.selectedLabel) {
            return (
                <Label
                    as="a"
                    tag
                    style={{
                        background: this.props.selectedLabel.color,
                        marginLeft: 30,
                        opacity: 1,
                        cursor: 'default',
                    }}
                >
                    {this.props.selectedLabel.label}
                </Label>
                // <div className="mia-tag">
                //     <div>{this.props.selectedLabel.label}</div>
                // </div>
            )
        }
    }
    render() {
        return (
            <Row
                style={{
                    padding: '0 0 25px 0',
                }}
            >
                <Col xs="6" sm="6" lg="6">
                    <InputGroup style={{ zIndex: 5 }}>
                        <Autocomplete
                            items={this.props.labels}
                            shouldItemRender={(item, value) =>
                                item.label.toLowerCase().indexOf(value.toLowerCase()) > -1
                            }
                            getItemValue={(item) => item.label}
                            renderInput={(props) => {
                                return (
                                    <input
                                        {...props}
                                        style={{ width: '300px' }}
                                        className="form-control"
                                    />
                                )
                            }}
                            renderItem={(item, highlighted) => (
                                <div
                                    className={`item ${
                                        highlighted ? 'item-highlighted' : ''
                                    }`}
                                    key={item.id}
                                >
                                    {item.label}
                                </div>
                            )}
                            value={this.state.value}
                            onChange={(e) => this.setState({ value: e.target.value })}
                            onSelect={(value, label) => {
                                this.setState({ value: value })
                                this.handleAddLabel(label)
                            }}
                        />

                        {this.renderSelectedLabel()}
                    </InputGroup>
                </Col>
                <Col xs="3" sm="3" lg="3">
                    <ButtonGroup className="float-left">
                        <Button
                            disabled={this.hist.isEmpty()}
                            className="btn-info"
                            onClick={this.handleUndo}
                        >
                            <Icon name="arrow left" />
                        </Button>
                        <Button
                            disabled={this.props.selectedLabel ? false : true}
                            className="btn-info"
                            onClick={this.handleSubmit}
                        >
                            <Icon name="arrow right" />
                        </Button>
                    </ButtonGroup>
                </Col>
                <Col xs="3" sm="3" lg="3">
                    <ButtonGroup className="float-right">
                        <Button className="btn-default" onClick={this.handleReverse}>
                            <i className="fa fa-arrows-h"></i> Reverse
                        </Button>
                        <Button className="btn-default" onClick={this.handleZoomIn}>
                            <i className="fa fa-search-plus"></i>
                        </Button>
                        <Button className="btn-default" onClick={this.handleZoomOut}>
                            <i className="fa fa-search-minus"></i>
                        </Button>
                        <ButtonDropdown
                            isOpen={this.state.dropdownOpen}
                            toggle={this.toggle}
                        >
                            <DropdownToggle caret>Amount</DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={this.handleMaxAmount}>
                                    1
                                </DropdownItem>
                                <DropdownItem onClick={this.handleMaxAmount}>
                                    5
                                </DropdownItem>
                                <DropdownItem onClick={this.handleMaxAmount}>
                                    10
                                </DropdownItem>
                                <DropdownItem onClick={this.handleMaxAmount}>
                                    20
                                </DropdownItem>
                                <DropdownItem onClick={this.handleMaxAmount}>
                                    50
                                </DropdownItem>
                                <DropdownItem onClick={this.handleMaxAmount}>
                                    100
                                </DropdownItem>
                                <DropdownItem onClick={this.handleMaxAmount}>
                                    150
                                </DropdownItem>
                                <DropdownItem onClick={this.handleMaxAmount}>
                                    200
                                </DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>
                    </ButtonGroup>
                </Col>
            </Row>
        )
    }
}

function mapStateToProps(state) {
    return {
        zoom: state.mia.zoom,
        maxAmount: state.mia.maxAmount,
        labels: state.mia.labels,
        selectedLabel: state.mia.selectedLabel,
        images: state.mia.images,
        proposedLabel: state.mia.proposedLabel,
    }
}

export default connect(mapStateToProps, {
    refreshToken,
    miaZoomIn,
    miaZoomOut,
    miaAmount,
    getMiaAnnos,
    getSpecialMiaAnnos,
    getMiaLabel,
    miaToggleActive,
    getWorkingOnAnnoTask,
    setMiaSelectedLabel,
    updateMia,
})(Control)
