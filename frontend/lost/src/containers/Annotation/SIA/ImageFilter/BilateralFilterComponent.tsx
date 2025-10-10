import { CCol, CFormSwitch, CRow } from '@coreui/react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './ClassicalRangeSlider.css'

type BilateralFilterConfig = {
    diameter: number
    sigmaColor: number
    sigmaSpace: number
}

type BilateralFilterComponentProps = {
    filterConfig: BilateralFilterConfig
    isActive: boolean
    onActiveChanged: (value: boolean) => void
    onFilterValueChange: (filterConfig: BilateralFilterConfig) => void
}

const BilateralFilterComponent = ({
    filterConfig,
    isActive,
    onActiveChanged,
    onFilterValueChange,
}: BilateralFilterComponentProps) => {
    return (
        <>
            <CRow>
                <CCol xs={1}>
                    <FontAwesomeIcon icon={faGripVertical as IconProp} size="lg" />
                </CCol>
                <CCol>
                    <strong>Bilateral</strong>
                </CCol>
                <CCol xs={1}>
                    <CFormSwitch
                        checked={isActive}
                        onChange={(e) => onActiveChanged(e.target.checked)}
                    />
                </CCol>
            </CRow>
            <CRow>
                <CCol xs={1}></CCol>
                <CCol>Diameter: {filterConfig.diameter}</CCol>
            </CRow>
            <CRow>
                <CCol xs={1}></CCol>
                <CCol>
                    <input
                        className="classic-range-slider"
                        type="range"
                        min={1}
                        max={40}
                        value={filterConfig.diameter}
                        onChange={(e) => {
                            const newConfig: BilateralFilterConfig = {
                                ...filterConfig,
                                diameter: parseInt(e.target.value),
                            }

                            onFilterValueChange(newConfig)
                        }}
                        // onMouseUp={(e) => onFilterValueUpdated(e.target.value)}
                    />
                </CCol>
            </CRow>

            <CRow>
                <CCol xs={1}></CCol>
                <CCol>Sigma Color: {filterConfig.sigmaColor}</CCol>
            </CRow>
            <CRow>
                <CCol xs={1}></CCol>
                <CCol>
                    <input
                        className="classic-range-slider"
                        type="range"
                        min={1}
                        max={40}
                        value={filterConfig.sigmaColor}
                        onChange={(e) => {
                            const newConfig: BilateralFilterConfig = {
                                ...filterConfig,
                                sigmaColor: parseInt(e.target.value),
                            }

                            onFilterValueChange(newConfig)
                        }}
                        // onMouseUp={(e) => onFilterValueUpdated(e.target.value)}
                    />
                </CCol>
            </CRow>

            <CRow>
                <CCol xs={1}></CCol>
                <CCol>Sigma Space: {filterConfig.sigmaSpace}</CCol>
            </CRow>
            <CRow>
                <CCol xs={1}></CCol>
                <CCol>
                    <input
                        className="classic-range-slider"
                        type="range"
                        min={1}
                        max={40}
                        value={filterConfig.sigmaSpace}
                        onChange={(e) => {
                            const newConfig: BilateralFilterConfig = {
                                ...filterConfig,
                                sigmaSpace: parseInt(e.target.value),
                            }

                            onFilterValueChange(newConfig)
                        }}
                        // onMouseUp={(e) => onFilterValueUpdated(e.target.value)}
                    />
                </CCol>
            </CRow>
        </>
    )
}

export default BilateralFilterComponent
