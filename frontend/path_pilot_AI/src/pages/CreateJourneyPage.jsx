import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faCode, faDiagramProject, faEye, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import GoalInput from "../components/create/GoalInput.jsx";
import HoursSlider from "../components/create/HoursSlider.jsx";
import LearningStyleOption from "../components/create/LearningStyleOption.jsx";
import LiveSummaryCard from "../components/create/LiveSummaryCard.jsx";
import SelectField from "../components/create/SelectField.jsx";
import SkillChipInput from "../components/create/SkillChipInput.jsx";
import { beginGenerationAttempt, devLog } from "../lib/roadmapSession.js";
import "../styles/create-journey.css";

const levelOptions = ["Beginner", "Mid-level", "Advanced"];
const timelineOptions = [
  "3 Months (Intensive)",
  "6 Months (Balanced)",
  "9 Months (Flexible)",
  "12 Months (Relaxed)",
];
const learningStyles = [
  { value: "Visual", icon: faEye },
  { value: "Reading", icon: faBookOpen },
  { value: "Practice", icon: faCode },
  { value: "Mixed", icon: faDiagramProject },
];

function CreateJourneyPage() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("Mid-level");
  const [timeline, setTimeline] = useState("6 Months (Balanced)");
  const [hours, setHours] = useState(15);
  const [skills, setSkills] = useState(["Python", "SQL"]);
  const [learningStyle, setLearningStyle] = useState("Practice");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitGuard = useRef(false);

  function handleSubmit(event) {
    event.preventDefault();
    if (submitGuard.current) {
      devLog("duplicate request blocked");
      return;
    }
    submitGuard.current = true;
    setIsSubmitting(true);
    const generationId = crypto.randomUUID();
    beginGenerationAttempt(generationId);
    navigate("/processing", {
      state: {
        learner: { goal, level, timeline, hours, skills, learningStyle },
        generationId,
      },
    });
  }

  return (
    <div className="create-page">
      <div className="create-layout">
        <form className="journey-form-card" onSubmit={handleSubmit}>
          <div className="step-label">STEP 1 OF 1</div>
          <h1>Define your trajectory.</h1>
          <p className="form-intro">
            Tell us where you want to go, and our AI will engineer the path.
          </p>

          <GoalInput value={goal} onChange={setGoal} />

          <div className="form-row">
            <SelectField
              label="Current Level"
              options={levelOptions}
              value={level}
              onChange={setLevel}
            />
            <SelectField
              label="Timeline"
              options={timelineOptions}
              value={timeline}
              onChange={setTimeline}
            />
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

          <button className="generate-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Opening workflow…' : 'Generate Roadmap'} <FontAwesomeIcon aria-hidden="true" icon={faWandMagicSparkles} />
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
            <div className="insight-heading">
              <strong>COMMUNITY INSIGHT</strong>
              <span className="mock-toggle" />
            </div>
            <p>
              “Users targeting ML roles with similar profiles typically add
              ‘PyTorch’ as a key missing skill.”
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CreateJourneyPage;
