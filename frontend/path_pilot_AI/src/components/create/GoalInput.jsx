function GoalInput({ value, onChange }) {
  return (
    <label className="field goal-field">
      <span>Career Goal</span>
      <input
        name="careerGoal"
        onChange={(event) => onChange(event.target.value)}
        placeholder="e.g. Senior Machine Learning Engineer at a Tier 1 startup"
        type="text"
        value={value}
      />
    </label>
  )
}

export default GoalInput
