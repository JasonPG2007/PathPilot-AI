import { faRoute, faScaleBalanced, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'
import FeatureCard from '../ui/FeatureCard.jsx'

function FeaturesSection() {
  return (
    <section className="features-section" id="features">
      <div className="section-heading"><h2>Precision Engineering for Career Growth</h2><p>Our multi-agent architecture ensures every lesson is vetted for quality and relevance to your specific target role.</p></div>
      <div className="feature-grid">
        <FeatureCard icon={faWandMagicSparkles} iconClass="feature-icon--purple" title="Planner Agent">Architects a comprehensive curriculum by mapping core skills, adjacent technologies, and measurable knowledge nodes required for mastery.</FeatureCard>
        <FeatureCard icon={faScaleBalanced} iconClass="feature-icon--green" title="Critic Agent">Audits the curriculum for logical gaps, resource quality, and project feasibility. It filters out low-value content, so you can learn for real-world roles.</FeatureCard>
        <FeatureCard icon={faRoute} iconClass="feature-icon--blue" title="Refined Journey">The final output is a high-fidelity, actionable roadmap with associated timelines, hands-on projects, and dynamic progress tracking.</FeatureCard>
      </div>
    </section>
  )
}

export default FeaturesSection
