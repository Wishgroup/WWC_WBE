import React from 'react'
import './iPadAirStyle.css'

const ColorSelector = ({ colors, selectedColor, onColorChange }) => {
  return (
    <div className="color-selector">
      <div className="color-options">
        {Object.entries(colors).map(([key, color]) => (
          <button
            key={key}
            className={`color-option ${selectedColor === key ? 'active' : ''}`}
            onClick={() => onColorChange(key)}
            aria-label={`Select ${color.name} color`}
          >
            <div
              className="color-swatch"
              style={{ backgroundColor: color.value }}
            />
            <span className="color-name">{color.name}</span>
          </button>
        ))}
      </div>
      <div className="color-preview">
        <div
          className="preview-product"
          style={{ backgroundColor: colors[selectedColor].value }}
        >
          <div className="preview-screen">
            <div className="screen-pattern"></div>
          </div>
        </div>
        <p className="preview-label">Selected: {colors[selectedColor].name}</p>
      </div>
    </div>
  )
}

export default ColorSelector


