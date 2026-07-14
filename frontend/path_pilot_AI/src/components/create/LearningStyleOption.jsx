function LearningStyleOption({ checked, icon, label, onChange, value }) {
  return (
    <label className={`learning-option${checked ? ' learning-option--selected' : ''}`}>
      <input checked={checked} name="learningStyle" onChange={() => onChange(value)} type="radio" value={value} />
      <span className="learning-icon" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </label>
  )
}

export default LearningStyleOption
