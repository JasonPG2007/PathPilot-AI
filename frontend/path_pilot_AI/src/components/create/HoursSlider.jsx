function HoursSlider({ value, onChange }) {
  const progress = ((value - 1) / 39) * 100

  return (
    <label className="slider-field">
      <span className="slider-heading"><span>Available Hours Per Week</span><strong>{value}h</strong></span>
      <input
        max="40"
        min="1"
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ '--slider-progress': `${progress}%` }}
        type="range"
        value={value}
      />
    </label>
  )
}

export default HoursSlider
