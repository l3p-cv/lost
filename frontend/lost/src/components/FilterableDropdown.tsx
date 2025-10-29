import { useState } from 'react'
import {
    CDropdown,
    CDropdownMenu,
    CDropdownItem,
    CFormInput,
    CDropdownToggle,
} from '@coreui/react'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'
import CoreIconButton from './CoreIconButton'

export type FilterItem = {
    key: number
    text: string
    value: number
}

type FilterableDropdownProps = {
    items: FilterItem[]
    selectedItem: FilterItem | undefined
    onChange: (item: FilterItem) => void
}

const FilterableDropdown = ({
    items,
    selectedItem,
    onChange,
}: FilterableDropdownProps) => {
    const [filter, setFilter] = useState<string>('')
    const [visible, setVisible] = useState<boolean>(false)

    const filteredItems = items.filter((item: FilterItem) =>
        item.text.toLowerCase().includes(filter.toLowerCase()),
    )

    const handleSelect = (item: FilterItem) => {
        onChange(item)
        setVisible(false)

        // reset filter after an option has been selected
        setFilter('')
    }

    return (
        <div>
            <CDropdown visible={visible}>
                <CDropdownToggle variant="outline" color="primary">
                    {selectedItem !== undefined && selectedItem.text
                        ? selectedItem.text
                        : 'Choose an item'}
                </CDropdownToggle>
                <CDropdownMenu
                    style={{ minWidth: '250px', position: 'absolute', left: '-80px' }}
                >
                    <div className="px-2 py-1">
                        <CFormInput
                            placeholder="Filter..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            autoFocus
                        />
                    </div>
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item: FilterItem) => (
                            <CDropdownItem
                                key={item.key}
                                onClick={() => handleSelect(item)}
                            >
                                {item.text}
                            </CDropdownItem>
                        ))
                    ) : (
                        <CDropdownItem disabled>No Results</CDropdownItem>
                    )}
                </CDropdownMenu>
            </CDropdown>
        </div>
    )
}

export default FilterableDropdown
