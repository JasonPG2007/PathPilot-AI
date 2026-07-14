import { useLocation } from 'react-router-dom'
import CriticReviewCard from '../components/roadmap/CriticReviewCard.jsx'
import LearnerSummary from '../components/roadmap/LearnerSummary.jsx'
import ProjectCard from '../components/roadmap/ProjectCard.jsx'
import RoadmapActions from '../components/roadmap/RoadmapActions.jsx'
import RoadmapHeader from '../components/roadmap/RoadmapHeader.jsx'
import RoadmapTimeline from '../components/roadmap/RoadmapTimeline.jsx'
import { createMockRoadmap, demoLearnerProfile } from '../data/mockRoadmap.js'
import '../styles/roadmap.css'

function RoadmapPage() {
  const location = useLocation()
  const learner = location.state?.learner ?? demoLearnerProfile
  const roadmap = location.state?.roadmap ?? createMockRoadmap(learner)

  return (
    <div className="roadmap-page">
      <RoadmapHeader goal={roadmap.goal} />
      <LearnerSummary learner={learner} roadmap={roadmap} />

      <div className="roadmap-content-grid">
        <RoadmapTimeline phases={roadmap.phases} />
        <aside className="roadmap-sidebar">
          <CriticReviewCard review={roadmap.criticReview} />
          <div className="skill-vault-card">
            <h2>Skill Vault</h2>
            <p>Focus-area readiness</p>
            {[
              ['Foundations', 88],
              ['Engineering', 74],
              ['ML Models', 62],
            ].map(([label, score]) => (
              <div className="skill-meter" key={label}>
                <div><span>{label}</span><strong>{score}%</strong></div>
                <div><span style={{ width: `${score}%` }} /></div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="projects-section">
        <div className="roadmap-section-heading"><div><span>▣</span><h2>Suggested Portfolio Projects</h2></div><p>Three role-aligned builds</p></div>
        <div className="project-grid">{roadmap.projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
      </section>

      <RoadmapActions />
    </div>
  )
}

export default RoadmapPage
