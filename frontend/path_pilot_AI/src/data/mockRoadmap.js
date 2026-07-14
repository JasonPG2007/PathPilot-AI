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
    confidenceScore: 94,
    phases: [
      {
        id: 1,
        title: 'Core Fundamentals',
        duration: '4 weeks',
        weeklyWorkload: `${learner.hours} hours/week`,
        description: 'Build mathematical fluency and advanced Python foundations for reliable ML systems.',
        skills: ['Python Mastery', 'Linear Algebra', 'NumPy/SciPy'],
        prerequisites: ['Python', 'Basic statistics'],
        milestones: ['Complete a numerical computing lab', 'Explain core ML mathematics', 'Pass the foundations review'],
        project: { title: 'Neural Net from Scratch', type: 'Foundation build', accent: 'violet' },
      },
      {
        id: 2,
        title: 'Machine Learning Operations (MLOps)',
        duration: '8 weeks',
        weeklyWorkload: `${learner.hours} hours/week`,
        description: 'Deploy, monitor, and scale production-grade machine learning pipelines with modern tooling.',
        skills: ['Docker/K8s', 'MLflow', 'CI/CD Pipelines'],
        prerequisites: ['Core Fundamentals', 'Git workflows'],
        milestones: ['Containerize a model API', 'Create an experiment registry', 'Deploy an automated training pipeline'],
        project: { title: 'Auto-Scaling Prediction API', type: 'Production system', accent: 'teal' },
      },
      {
        id: 3,
        title: 'Advanced LLM Architectures',
        duration: '12 weeks',
        weeklyWorkload: `${learner.hours} hours/week`,
        description: 'Fine-tune large language models and implement retrieval-augmented generation systems.',
        skills: ['Transformers', 'Vector DBs', 'PyTorch'],
        prerequisites: ['Machine Learning Operations', 'Neural networks'],
        milestones: ['Fine-tune a domain model', 'Build a retrieval evaluation suite', 'Present the capstone architecture'],
        project: { title: 'Multi-Modal AI Assistant', type: 'Capstone', accent: 'blue' },
      },
    ],
    criticReview: {
      riskLevel: 'Low',
      issues: ['Software engineering depth may need reinforcement', 'The original final phase was too dense'],
      changesMade: ['Added two weeks for math prerequisite review', 'Condensed MLOps modules around production essentials', 'Increased capstone time for LLM fine-tuning'],
      timelineAdjustments: 'Rebalanced the roadmap into a realistic 24-week sequence with review buffers.',
      prerequisiteCorrections: 'Moved neural-network foundations ahead of advanced transformer work.',
    },
    projects: [
      { id: 1, title: 'Micro-Transformer', category: 'NLP', description: 'Build a transformer from the ground up using only core tensor operations.', accent: 'violet' },
      { id: 2, title: 'Scalable Inference Engine', category: 'MLOps', description: 'Deploy an auto-scaling model-serving platform with monitoring and tests.', accent: 'teal' },
      { id: 3, title: 'Personal Agent RAG', category: 'Agents', description: 'Create a production-ready retrieval-augmented assistant with evaluation.', accent: 'blue' },
    ],
  }
}
