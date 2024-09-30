import React from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { useTranslation } from 'react-i18next'

import de from 'date-fns/locale/de'
import './SingleInputDateRangePicker.css'
import { CTooltip } from '@coreui/react'

registerLocale('de', de)

const SingleInputDateRangePicker = ({
    beginDate,
    endDate,
    setBeginDate,
    setEndDate,
    maxDate = new Date(),
    setLocale = 'de',
    disabled,
    showPopUp,
    style,
}) => {
    const { t } = useTranslation()

    const onChange = (dates) => {
        if (Array.isArray(dates)) {
            const [start, end] = dates
            setBeginDate(start)
            setEndDate(end)
        } else {
            setBeginDate(dates)
        }
    }

    const datePickerComponent = (
        <div style={{ ...style, width: 'max-content' }}>
            <DatePicker
                startDate={beginDate}
                endDate={endDate}
                selected={beginDate}
                onChange={onChange}
                maxDate={maxDate}
                locale={setLocale}
                disabled={disabled}
                monthsShown={2}
                className="single-input-date-range"
                selectsRange
                showTimeInput
                dateFormat="dd.MM.yyyy HH:mm"
                timeFormat="HH:mm"
                showIcon
                placeholderText={'Select date'}
                shouldCloseOnSelect={false}
                isClearable
                popperPlacement="bottom-start"
            />
        </div>
    )

    if (showPopUp) {
        return (
            <CTooltip
                content={t('ssi.evaluation.disableRealtimeMsg')}
                disabled={!disabled} // disabled when date picker
                is
                enabled // trigger={datePickerComponent}
                wide
            >
                {datePickerComponent}
            </CTooltip>
        )
    }
    return datePickerComponent
}

export default SingleInputDateRangePicker
