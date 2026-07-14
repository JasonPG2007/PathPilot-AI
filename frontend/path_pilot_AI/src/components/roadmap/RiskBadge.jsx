function RiskBadge({ level }) {
  return <span className={`risk-badge risk-badge--${level.toLowerCase()}`}>RISK: {level.toUpperCase()}</span>
}

export default RiskBadge
