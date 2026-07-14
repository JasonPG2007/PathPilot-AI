import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GoalInput from '../components/create/GoalInput.jsx'
import HoursSlider from '../components/create/HoursSlider.jsx'
import LearningStyleOption from '../components/create/LearningStyleOption.jsx'
import LiveSummaryCard from '../components/create/LiveSummaryCard.jsx'
import SelectField from '../components/create/SelectField.jsx'
import SkillChipInput from '../components/create/SkillChipInput.jsx'
import '../styles/create-journey.css'

const levelOptions = ['Beginner', 'Mid-level', 'Advanced']
const timelineOptions = ['3 Months (Intensive)', '6 Months (Balanced)', '9 Months (Flexible)', '12 Months (Relaxed)']
const learningStyles = [
  { value: 'Visual', icon: '◉' },
  { value: 'Reading', icon: '▤' },
  { value: 'Practice', icon: '▣' },
  { value: 'Mixed', icon: '◇' },
]

function CreateJourneyPage() {
  const navigate = useNavigate()
  const [goal, setGoal] = useState('')
  const [level, setLevel] = useState('Mid-level')
  const [timeline, setTimeline] = useState('6 Months (Balanced)')
  const [hours, setHours] = useState(15)
  const [skills, setSkills] = useState(['Python', 'SQL'])
  const [learningStyle, setLearningStyle] = useState('Practice')

  function handleSubmit(event) {
    event.preventDefault()
    navigate('/processing')
  }

  return (
    <div className="create-page">
      <div className="create-layout">
        <form className="journey-form-card" onSubmit={handleSubmit}>
          <div className="step-label">STEP 1 OF 1</div>
          <h1>Define your trajectory.</h1>
          <p className="form-intro">Tell us where you want to go, and our AI will engineer the path.</p>

          <GoalInput value={goal} onChange={setGoal} />

          <div className="form-row">
            <SelectField label="Current Level" options={levelOptions} value={level} onChange={setLevel} />
            <SelectField label="Timeline" options={timelineOptions} value={timeline} onChange={setTimeline} />
          </div>

          <HoursSlider value={hours} onChange={setHours} />
          <SkillChipInput skills={skills} onChange={setSkills} />

          <fieldset className="learning-style-fieldset">
            <legend>Preferred Learning Style</legend>
            <div className="learning-options">
              {learningStyles.map((style) => (
                <LearningStyleOption
                  checked={learningStyle === style.value}
                  icon={style.icon}
                  key={style.value}
                  label={style.value}
                  onChange={setLearningStyle}
                  value={style.value}
                />
              ))}
            </div>
          </fieldset>

          <button className="generate-button" type="submit">
            Generate Roadmap <span aria-hidden="true">✣</span>
          </button>
        </form>

        <aside className="summary-column">
          <LiveSummaryCard
            goal={goal}
            hours={hours}
            learningStyle={learningStyle}
            level={level}
            timeline={timeline}
          />
          <div className="community-insight">
            <div className="insight-heading"><strong>COMMUNITY INSIGHT</strong><span className="mock-toggle" /></div>
            <p>“Users targeting ML roles with similar profiles typically add ‘PyTorch’ as a key missing skill.”</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CreateJourneyPage
