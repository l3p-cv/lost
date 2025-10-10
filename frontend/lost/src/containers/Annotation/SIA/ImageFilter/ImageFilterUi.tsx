import { CButton, CContainer, CRow } from '@coreui/react'
import { ImageFilter } from '../../../../types/SiaTypes'
import ImageFilterComponent from './ImageFilterComponent'
import CannyFilterComponent from './CannyFilterComponent'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import BilateralFilterComponent from './BilateralFilterComponent'

type ImageFilterUiProps = {
    appliedFilters?: ImageFilter[]
    onFiltersChanged?: (filters: ImageFilter[]) => void
}

const ImageFilterUi = ({
    appliedFilters = [],
    onFiltersChanged = (_) => {},
}: ImageFilterUiProps) => {
    const [isHistogramActive, setIsHistogramActive] = useState<boolean>(false)
    const [isCannyActive, setIsCannyActive] = useState<boolean>(false)
    const [isBilateralActive, setIsBilateralActive] = useState<boolean>(false)
    const [claheClipLimit, setClaheClipLimit] = useState<number>(1)
    const [cannyThreshholds, setCannyThreshholds] = useState({ min: 0, max: 100 })
    const [bilateralFilterConfig, setBilateralFilterConfig] =
        useState<BilateralFilterConfig>({
            diameter: 1,
            sigmaColor: 1,
            sigmaSpace: 1,
        })

    useEffect(() => {
        if (appliedFilters.length === 0) return

        appliedFilters.forEach((filter: ImageFilter) => {
            if (filter.name == 'clahe') {
                setIsHistogramActive(true)
                setClaheClipLimit(filter.configuration.clipLimit)
            } else if (filter.name == 'cannyEdge') {
                setIsCannyActive(true)
                setCannyThreshholds({
                    min: filter.configuration.lowerThreshold,
                    max: filter.configuration.upperThreshold,
                })
            }
        })
    }, [appliedFilters])

    const sendFilterUpdate = () => {
        const newFilterData: ImageFilter[] = []

        if (isCannyActive)
            newFilterData.push({
                name: 'cannyEdge',
                configuration: {
                    lowerThreshold: cannyThreshholds.min,
                    upperThreshold: cannyThreshholds.max,
                },
            })

        if (isHistogramActive)
            newFilterData.push({
                name: 'clahe',
                configuration: {
                    clipLimit: claheClipLimit,
                },
            })

        if (isBilateralActive)
            newFilterData.push({
                name: 'bilateral',
                configuration: bilateralFilterConfig,
            })

        onFiltersChanged(newFilterData)
    }

    return (
        <CContainer>
            <CRow className="mb-3">
                <h3>Image Filters:</h3>
            </CRow>
            <CRow className="mb-3">
                <ImageFilterComponent
                    filterValue={claheClipLimit}
                    onFilterValueChange={setClaheClipLimit}
                    isActive={isHistogramActive}
                    onActiveChanged={setIsHistogramActive}
                />
            </CRow>

            <CRow className="mb-3">
                <CannyFilterComponent
                    className="mb-3"
                    cannyThreshholds={cannyThreshholds}
                    isActive={isCannyActive}
                    onActiveChanged={setIsCannyActive}
                    onThreshholdChange={setCannyThreshholds}
                />
            </CRow>
            <CRow className="mb-3">
                <BilateralFilterComponent
                    filterConfig={bilateralFilterConfig}
                    isActive={isBilateralActive}
                    onActiveChanged={setIsBilateralActive}
                    onFilterValueChange={setBilateralFilterConfig}
                />
            </CRow>
            <CRow>
                <CButton color="primary" variant="outline" onClick={sendFilterUpdate}>
                    <FontAwesomeIcon icon={faCheck as IconProp} />
                    &nbsp; Save
                </CButton>
            </CRow>
        </CContainer>
    )
}

export default ImageFilterUi
