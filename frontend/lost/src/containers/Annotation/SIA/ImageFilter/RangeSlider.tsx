import { useEffect, useState } from 'react'

const RangeSlider = ({ min, max, value, step, onChange }) => {
  const [minValue, setMinValue] = useState(value?.min)
  const [maxValue, setMaxValue] = useState(value?.max)

  useEffect(() => {
    if (value) {
      setMinValue(value.min)
      setMaxValue(value.max)
    }
  }, [value])

  const handleMinChange = (e) => {
    const newMinVal = Math.min(+e.target.value, maxValue)
    if (!value) setMinValue(newMinVal)
    onChange({ min: newMinVal, max: maxValue })
  }

  const handleMaxChange = (e) => {
    const newMaxVal = Math.max(+e.target.value, minValue)
    if (!value) setMaxValue(newMaxVal)
    onChange({ min: minValue, max: newMaxVal })
  }

  const minPos = ((minValue - min) / (max - min)) * 100
  const maxPos = ((maxValue - min) / (max - min)) * 100

  const thumbSize = 16
  const trackHeight = 6 // Höhe der Slider-Spur

  const wrapperStyle = {
    position: 'relative',
    height: `${thumbSize + 10}px`,
    display: 'flex',
    alignItems: 'center',
  }

  const inputStyle = {
    position: 'absolute',
    width: `calc(100% + ${thumbSize}px)`,
    margin: `0 ${-thumbSize / 2}px`,
    pointerEvents: 'none',
    WebkitAppearance: 'none',
    appearance: 'none',
    height: `${thumbSize}px`,
    background: 'transparent',
    zIndex: 2,
    padding: 0,
    top: '50%',
    transform: 'translateY(-50%)',
  }

  const sliderTrackStyle = {
    position: 'absolute',
    width: '100%',
    height: `${trackHeight}px`,
    borderRadius: '3px',
    background: 'var(--cui-secondary-bg, #e0e0e0)',
    left: 0,
    right: 0,
  }

  const sliderRangeStyle = {
    position: 'absolute',
    height: '100%',
    background: 'var(--cui-primary, #0d6efd)',
    left: `${minPos}%`,
    right: `${100 - maxPos}%`,
  }

  const thumbStyle = {
    WebkitAppearance: 'none',
    appearance: 'none',
    pointerEvents: 'all',
    width: `${thumbSize}px`,
    height: `${thumbSize}px`,
    background: 'var(--cui-primary, #0d6efd)',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 3,
    marginTop: `${(trackHeight - thumbSize) / 2}px`,
  }

  const minInputStyle = { ...inputStyle, zIndex: minValue > maxValue - step ? 5 : 4 }

  return (
    <div style={wrapperStyle}>
      <div style={sliderTrackStyle}>
        <div style={sliderRangeStyle} />
      </div>
      <input
        type="range"
        value={minValue}
        min={min}
        max={max}
        step={step}
        onChange={handleMinChange}
        style={minInputStyle}
      />
      <input
        type="range"
        value={maxValue}
        min={min}
        max={max}
        step={step}
        onChange={handleMaxChange}
        style={{ ...inputStyle, zIndex: 4 }}
      />
      <style>{`
                input[type='range']::-webkit-slider-thumb {
                    ${Object.entries(thumbStyle)
                      .map(
                        ([key, value]) =>
                          `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`,
                      )
                      .join('\n')}
                }
                input[type='range']::-moz-range-thumb {
                    ${Object.entries(thumbStyle)
                      .map(
                        ([key, value]) =>
                          `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`,
                      )
                      .join('\n')}
                }
            `}</style>
    </div>
  )
}

export default RangeSlider
