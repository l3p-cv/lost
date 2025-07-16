import { Component } from 'react'
import Autocomplete from 'react-autocomplete'
import { connect } from 'react-redux'
import {
    Button,
    ButtonDropdown,
    ButtonGroup,
    Col,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Row,
} from 'reactstrap'
import actions from '../../../actions'

import { FaArrowsAltH, FaSearchMinus, FaSearchPlus } from 'react-icons/fa'
import UndoRedo from '../../../libs/hist'
import './Tag.scss'
import { CButton, CButtonGroup } from '@coreui/react'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../../components/IconButton'

const {
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
            newProposedLbl: true,
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
        this.setState({ value: '', newProposedLbl: true })
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

    componentDidUpdate(prevProps) {
        console.log('proposedLabel on every update', this.props.proposedLabel)
        if (this.props.proposedLabel) {
            console.log('selectedLabel', this.props.selectedLabel)
            if (this.state.newProposedLbl) {
                if (prevProps.images !== this.props.images) {
                    // if (prevProps.proposedLabel !== this.props.proposedLabel) {
                    console.log('proposedLabel', this.props.proposedLabel)
                    this.handleAddLabel(
                        this.props.labels.find(
                            (value) => value.id === this.props.proposedLabel,
                        ),
                    )
                    this.setState({ newProposedLbl: false })
                }
            }
        }
    }
    renderSelectedLabel() {
        if (this.props.selectedLabel) {
            return (
                <CButton
                    style={{
                        background: this.props.selectedLabel.color,
                        marginLeft: 30,
                        opacity: 1,
                        cursor: 'default',
                    }}
                >
                    {this.props.selectedLabel.label}
                </CButton>
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
                </Col>
                <Col xs="3" sm="3" lg="3">
                    <CButtonGroup>
                        <IconButton
                            isOutline={false}
                            color="primary"
                            icon={faArrowLeft}
                            text="Undo"
                            onClick={this.handleUndo}
                        ></IconButton>

                        <IconButton
                            isOutline={false}
                            color="primary"
                            icon={faArrowRight}
                            isTextLeft={true}
                            text="Submit"
                            onClick={this.handleSubmit}
                        ></IconButton>
                    </CButtonGroup>
                </Col>
                <Col xs="3" sm="3" lg="3">
                    <ButtonGroup className="float-right">
                        <Button className="btn-default" onClick={this.handleReverse}>
                            <FaArrowsAltH /> Reverse
                        </Button>
                        <Button className="btn-default" onClick={this.handleZoomIn}>
                            <FaSearchPlus />
                        </Button>
                        <Button className="btn-default" onClick={this.handleZoomOut}>
                            <FaSearchMinus />
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
