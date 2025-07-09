import React, { useState } from 'react'
import { CDropdown, CDropdownMenu, CDropdownItem, CFormInput } from '@coreui/react'
import IconButton from './IconButton'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'

const FilterableDropdown = ({ items, selectedItem, onChange }) => {
    const [filter, setFilter] = useState('')
    const [visible, setVisible] = useState(false)

    const filteredItems = items.filter((item) =>
        item.text.toLowerCase().includes(filter.toLowerCase()),
    )

    const handleSelect = (item) => {
        onChange(item)
        setVisible(false)

        // reset filter after an option has been selected
        setFilter('')
    }

    return (
        <div>
            <IconButton
                text={
                    selectedItem !== undefined && selectedItem.text
                        ? selectedItem.text
                        : 'Choose an item'
                }
                isTextLeft={true}
                icon={faCaretDown}
                onClick={() => setVisible(true)}
            />

            <CDropdown visible={visible}>
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
                        filteredItems.map((item) => (
                            <CDropdownItem
                                key={item.key}
                                onClick={() => handleSelect(item)}
                            >
                                {item.text}
                            </CDropdownItem>
                        ))
                    ) : (
                        <CDropdownItem disabled>Keine Treffer</CDropdownItem>
                    )}
                </CDropdownMenu>
            </CDropdown>
        </div>
    )
}

export default FilterableDropdown
