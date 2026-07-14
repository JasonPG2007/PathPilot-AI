export const demoLearnerProfile = {
  goal: 'Become a Machine Learning Engineer',
  level: 'Mid-level',
  timeline: '6 Months (Balanced)',
  hours: 15,
  skills: ['Python', 'SQL'],
  learningStyle: 'Practice',
}

export function createMockRoadmap(learner) {
  return {
    id: 'demo-roadmap',
    goal: learner.goal || demoLearnerProfile.goal,
    summary: `A practical ${learner.timeline.toLowerCase()} path designed for a ${learner.level.toLowerCase()} learner with ${learner.hours} hours available each week.`,
    weeklyHours: learner.hours,
    phases: [
      {
        id: 1,
        title: 'Strengthen the Foundations',
        duration: 'Weeks 1–4',
        skills: ['Core concepts', 'Essential tooling', 'Problem solving'],
        project: 'Build a focused fundamentals project',
      },
      {
        id: 2,
        title: 'Develop Applied Skills',
        duration: 'Weeks 5–14',
        skills: ['Applied workflows', 'System design', 'Testing and iteration'],
        project: 'Create an end-to-end portfolio project',
      },
      {
        id: 3,
        title: 'Demonstrate Role Readiness',
        duration: 'Weeks 15–24',
        skills: ['Advanced practice', 'Portfolio refinement', 'Interview preparation'],
        project: 'Ship and present a capstone project',
      },
    ],
    criticReview: {
      riskLevel: 'Low',
      issues: ['Protect weekly project time', 'Review prerequisites before advanced work'],
      recommendedChanges: ['Add a review week after each major phase'],
    },
  }
}
