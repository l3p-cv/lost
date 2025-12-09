import { Component } from 'react'
import Autocomplete from 'react-autocomplete'
import { connect } from 'react-redux'
import BaseContainer from '../../../components/BaseContainer'
import {
  CButtonGroup,
  CCol,
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CFormSelect,
  CInputGroup,
  CRow,
} from '@coreui/react'
import {
  faArrowLeft,
  faArrowRight,
  faArrowsAltH,
  faBan,
  faSearch,
  faSearchLocation,
  faSearchMinus,
  faSearchPlus,
  faTag,
} from '@fortawesome/free-solid-svg-icons'
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
      console.log('MIA IDs: ', miaIds)
      this.props.getSpecialMiaAnnos(miaIds, this.props.getWorkingOnAnnoTask)

      // TODO:
      this.hist.undoMia()
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
            this.props.labels.find((value) => value.id === this.props.proposedLabel),
          )
          this.setState({ newProposedLbl: false })
        }
      }
    }
  }
  renderSelectedLabel() {
    if (this.props.selectedLabel) {
      return (
        <TagLabel
          label={this.props.selectedLabel.label}
          color={this.props.selectedLabel.color}
        />
      )
    }
  }
  render() {
    console.log('Props: ', this.props)
    console.log('History: ', this.hist)
    return (
      <CRow
        className="align-items-center"
        style={{
          padding: '0px 0px 25px 0px',
        }}
      >
        <CCol xs="4" sm="4" lg="4" className="d-flex justify-content-center">
          {/* TODO: INCLUDE JUNK BUTTON!!! */}
          {/* TODO: INCLUDE Permanent Reverse!!! */}
          <CButtonGroup>
            <CoreIconButton
              onClick={this.handleZoomIn}
              color="primary"
              icon={faSearchPlus}
              isOutline={true}
              toolTip="Zoom In"
            />
            <CoreIconButton
              onClick={this.handleZoomOut}
              color="primary"
              icon={faSearchMinus}
              isOutline={true}
              toolTip="Zoom Out"
            />
            {/* <CoreIconButton
              onClick={this.handleJunking}
              color="primary"
              icon={faBan}
              text=""
              isOutline={true}
              toolTip="Junk selected Images"
            /> */}
            <CoreIconButton
              onClick={this.handleReverse}
              color="primary"
              icon={faArrowsAltH}
              toolTip="Reverse Selection"
              isOutline={true}
            />
            <CDropdown>
              <CDropdownToggle color="primary" variant="outline" caret>
                Amount
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={this.handleMaxAmount}>1</CDropdownItem>
                <CDropdownItem onClick={this.handleMaxAmount}>5</CDropdownItem>
                <CDropdownItem onClick={this.handleMaxAmount}>10</CDropdownItem>
                <CDropdownItem onClick={this.handleMaxAmount}>20</CDropdownItem>
                <CDropdownItem onClick={this.handleMaxAmount}>50</CDropdownItem>
                <CDropdownItem onClick={this.handleMaxAmount}>100</CDropdownItem>
                <CDropdownItem onClick={this.handleMaxAmount}>150</CDropdownItem>
                <CDropdownItem onClick={this.handleMaxAmount}>200</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </CButtonGroup>
        </CCol>
        <CCol xs="4" sm="4" lg="4">
          <CButtonGroup style={{ zIndex: 5 }}>
            <CoreIconButton icon={faTag} isOutline={false} />
            <CInputGroup>
              <CFormSelect
                style={{
                  width: '250px',
                  maxWidth: '250px',
                  borderRadius: 0,
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
                }}
                value={this.state.value}
                onChange={(e) => {
                  const selectedId = parseInt(e.target.value)
                  this.setState({ value: selectedId }) // Save raw value for input field
                  // Find the selected label object
                  const selectedLabel = this.props.labels.find(
                    (lbl) => lbl.id === selectedId,
                  )
                  this.handleAddLabel(selectedLabel)
                }}
              >
                <option value="">Select label...</option>
                {this.props.labels.map((label) => (
                  <option key={label.id} value={label.id}>
                    {label.label}
                  </option>
                ))}
              </CFormSelect>
              {this.renderSelectedLabel()}
            </CInputGroup>
          </CButtonGroup>
        </CCol>
        <CCol xs="1" sm="1" lg="1" className="d-flex justify-content-start">
          <CButtonGroup>
            <CoreIconButton
              icon={faArrowLeft}
              isOutline={true}
              disabled={this.hist.isEmpty()} // TODO: wrong with current implementation!!!
              color="primary"
              onClick={this.handleUndo}
              toolTip="Undo last Label Selection"
            />
            <CoreIconButton
              icon={faArrowRight}
              isOutline={true}
              disabled={
                this.props.selectedLabel && this.props.images.length ? false : true
              }
              color="primary"
              onClick={this.handleSubmit}
              toolTip="Give Images selected Label"
            />
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
