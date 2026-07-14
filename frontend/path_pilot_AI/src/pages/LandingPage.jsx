import AgentWorkflowVisual from '../components/landing/AgentWorkflowVisual.jsx'
import FeaturesSection from '../components/landing/FeaturesSection.jsx'
import FinalCtaSection from '../components/landing/FinalCtaSection.jsx'
import HeroSection from '../components/landing/HeroSection.jsx'
import HowItWorksSection from '../components/landing/HowItWorksSection.jsx'
import TrustedBySection from '../components/landing/TrustedBySection.jsx'
import '../styles/landing.css'

function LandingPage() {
  return (
    <div className="landing-page" id="top">
      <HeroSection visual={<AgentWorkflowVisual />} />
      <TrustedBySection />
      <FeaturesSection />
      <HowItWorksSection />
      <FinalCtaSection />
    </div>
  )
}

export default LandingPage
