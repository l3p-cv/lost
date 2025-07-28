import { Component } from 'react'
import Autocomplete from 'react-autocomplete'
import { connect } from 'react-redux'
import { CButtonGroup, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CInputGroup, CRow } from '@coreui/react'
import { faArrowLeft, faArrowRight, faArrowsAltH, faSearchMinus, faSearchPlus } from '@fortawesome/free-solid-svg-icons'
import CoreIconButton from '../../../components/CoreIconButton'
import TagLabel from '../../../components/TagLabel'
import actions from '../../../actions'

import UndoRedo from '../../../libs/hist'
import './Tag.scss'

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
                <TagLabel label={this.props.selectedLabel.label} color={this.props.selectedLabel.color} />
            )
        }
    }
    render() {
        return (
            <CRow
                style={{
                    padding: '0 0 25px 0',
                }}
            >
                <CCol xs="6" sm="6" lg="6">
                    <CInputGroup style={{ zIndex: 5 }}>
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
                    </CInputGroup>
                </CCol>
                <CCol xs="3" sm="3" lg="3">
                    <CButtonGroup className="float-left">
                        <CoreIconButton
                            icon={faArrowLeft}
                            isOutline={false}
                            disabled={this.hist.isEmpty()}
                            // className="btn-info"
                            color='info'
                            onClick={this.handleUndo}
                        />
                        <CoreIconButton
                            icon={faArrowRight}
                            isOutline={false}
                            disabled={this.props.selectedLabel ? false : true}
                            // className="btn-info"
                            color='info'
                            onClick={this.handleSubmit}
                        />
                    </CButtonGroup>
                </CCol>
                <CCol xs="3" sm="3" lg="3">
                    <CButtonGroup className="float-right">
                        <CoreIconButton 
                            onClick={this.handleReverse}
                            color='secondary'
                            icon={faArrowsAltH}
                            text="Reverse"
                            isOutline={false}
                        />
                        <CoreIconButton 
                            onClick={this.handleZoomIn}
                            color='secondary'
                            icon={faSearchPlus}
                            isOutline={false}
                        />
                        <CoreIconButton 
                            onClick={this.handleZoomOut}
                            color='secondary'
                            icon={faSearchMinus}
                            isOutline={false}
                        />
                        <CDropdown>
                            <CDropdownToggle color='secondary' caret>Amount</CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem onClick={this.handleMaxAmount}>
                                    1
                                </CDropdownItem>
                                <CDropdownItem onClick={this.handleMaxAmount}>
                                    5
                                </CDropdownItem>
                                <CDropdownItem onClick={this.handleMaxAmount}>
                                    10
                                </CDropdownItem>
                                <CDropdownItem onClick={this.handleMaxAmount}>
                                    20
                                </CDropdownItem>
                                <CDropdownItem onClick={this.handleMaxAmount}>
                                    50
                                </CDropdownItem>
                                <CDropdownItem onClick={this.handleMaxAmount}>
                                    100
                                </CDropdownItem>
                                <CDropdownItem onClick={this.handleMaxAmount}>
                                    150
                                </CDropdownItem>
                                <CDropdownItem onClick={this.handleMaxAmount}>
                                    200
                                </CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                    </CButtonGroup>
                </CCol>
            </CRow>
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
