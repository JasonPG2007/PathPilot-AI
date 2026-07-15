function ProjectCard({ onExplain, project }) {
  return (
    <article className="project-card">
      <div className={`project-art project-art--${project.accent}`}><span className="project-orb" /><span className="project-grid-lines" /><small>{project.category}</small></div>
      <div className="project-copy"><h3>{project.title}</h3><p>{project.description}</p><span>Portfolio ready <FontAwesomeIcon aria-hidden="true" icon={faArrowRight} /></span><button className="why-action" onClick={onExplain} type="button"><FontAwesomeIcon aria-hidden="true" icon={faCircleQuestion} /> Why?</button></div>
    </article>
  )
}

export default ProjectCard
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faCircleQuestion } from '@fortawesome/free-solid-svg-icons'
