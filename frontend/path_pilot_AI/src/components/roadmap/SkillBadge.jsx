function SkillBadge({ children, completed, onToggle }) {
  return (
    <span className={`skill-badge${completed ? ' skill-badge--complete' : ''}`}>
      <span>{children}</span>
      <button aria-label={`${completed ? 'Undo completion for' : 'Mark complete'} ${children}`} aria-pressed={completed} onClick={onToggle} type="button">{completed ? 'Undo' : 'Mark complete'}</button>
    </span>
  )
}

export default SkillBadge
