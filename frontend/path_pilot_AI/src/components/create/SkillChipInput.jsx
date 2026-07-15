import { useState } from 'react'

function SkillChipInput({ skills, onChange }) {
  const [draftSkill, setDraftSkill] = useState('')

  function addSkill() {
    const nextSkill = draftSkill.trim()
    if (nextSkill && !skills.some((skill) => skill.toLowerCase() === nextSkill.toLowerCase())) {
      onChange([...skills, nextSkill])
    }
    setDraftSkill('')
  }

  function removeSkill(skillToRemove) {
    onChange(skills.filter((skill) => skill !== skillToRemove))
  }

  return (
    <div className="skill-field">
      <span className="field-label">Existing Skills</span>
      <div className="skill-input-row">
        {skills.map((skill) => (
          <span className="skill-chip" key={skill}>
            {skill}
<button aria-label={`Remove ${skill}`} onClick={() => removeSkill(skill)} type="button"><FontAwesomeIcon aria-hidden="true" icon={faXmark} /></button>
          </span>
        ))}
        <div className="add-skill-form">
          <input
            aria-label="Add a skill"
            onChange={(event) => setDraftSkill(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addSkill()
              }
            }}
            placeholder="Add Skill +"
            value={draftSkill}
          />
        </div>
      </div>
    </div>
  )
}

export default SkillChipInput
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
