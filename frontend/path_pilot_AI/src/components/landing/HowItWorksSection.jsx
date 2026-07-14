const steps = [
  { number: '1', title: 'Define Your Goal', text: 'Tell us where you want to go — “Senior Backend Engineer at Stripe” or “ML Researcher at OpenAI.” We are specific, so you can be.' },
  { number: '2', title: 'AI Collaboration', text: 'Our Planner and Critic agents debate the most efficient route, examining real-world documentation, videos, and projects.' },
  { number: '3', title: 'Launch Roadmap', text: 'Receive your final, interactive dashboard. Start learning with daily milestones and AI-generated check-ins.' },
]

function HowItWorksSection() {
  return (
    <section className="how-section" id="how-it-works">
      <div className="how-heading">
        <div><h2>From Ambition to Execution</h2><p>Three steps to a career-defining curriculum. No fluff, just the most efficient path to expertise.</p></div>
        <div className="community-proof"><div className="avatar-stack"><span>JD</span><span>AK</span><span>MS</span><span>+</span></div><p><strong>2,400+</strong> journeys launched</p></div>
      </div>
      <div className="steps-grid">
        {steps.map((step) => (
          <article className="step" key={step.number}>
            <div className="step-number">{step.number}</div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default HowItWorksSection
