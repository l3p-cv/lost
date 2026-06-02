import { CButton, CPopover, CTooltip } from '@coreui/react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ImageFilterUi from './ImageFilter/ImageFilterUi'
import { ImageFilter } from '../../../types/SiaTypes'
import { useEffect, useRef, useState } from 'react'

type ImageFilterButtonProps = {
  isDisabled?: boolean
  appliedFilters?: ImageFilter[]
  tooltip?: String
  onFiltersChanged: (filters: ImageFilter[]) => void
  imageIsLoading?: boolean
  imageId?: number
}

const ImageFilterButton = ({
  isDisabled = false,
  appliedFilters = [],
  tooltip = '',
  onFiltersChanged = () => {},
  imageIsLoading = false,
  imageId,
}: ImageFilterButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    setIsOpen(false)
  }, [imageId])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const clickedInsideButton = containerRef.current && containerRef.current.contains(e.target as Node)
      const clickedInsidePopover = (e.target as Element).closest?.('.popover') !== null
      if (!clickedInsideButton && !clickedInsidePopover) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const customPopoverStyle = {
    '--cui-popover-max-width': '300px',
  }

  return (
    <div ref={containerRef} style={{ display: 'inline-block' }}>
      <CPopover
        placement="bottom"
        visible={isOpen}
        content={
          <ImageFilterUi
            appliedFilters={appliedFilters}
            onFiltersChanged={onFiltersChanged}
            imageIsLoading={imageIsLoading}
            onSave={() => setIsOpen(false)}
          />
        }
        style={customPopoverStyle}
      >
        <span className="d-inline-block">
          <CTooltip content={tooltip} placement="top">
            <CButton
              color="primary"
              disabled={isDisabled}
              variant="outline"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <FontAwesomeIcon icon={faFilter as IconProp} />
            </CButton>
          </CTooltip>
        </span>
      </CPopover>
    </div>
  )
}

export default ImageFilterButton
