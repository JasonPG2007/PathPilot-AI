import assert from 'node:assert/strict'
import test from 'node:test'
import { createRoadmapPdfModel } from '../src/services/roadmapPdf.js'

test('PDF model includes cover, summary, phases, projects, and per-phase resources', () => {
  const project = { title: 'Deploy a model', type: 'Portfolio', description: 'Ship a tested model.' }
  const roadmap = {
    goal: 'Become an ML Engineer', startingLevel: 'Beginner', weeklyHours: 8, timeline: '9 Months (Balanced)', feasibilityScore: 82,
    criticReview: { riskLevel: 'Low', issues: ['Scope'], changesMade: ['Focused scope'], timelineAdjustments: 'No change.', prerequisiteCorrections: 'SQL comes first.' },
    phases: [{ id: 1, title: 'Foundations', duration: 'Months 1-3', weeklyWorkload: '8 hours/week', description: 'Learn foundations.', prerequisites: ['SQL'], skills: ['Python'], milestones: ['Build a model'], recommendedProject: project }],
  }
  const resource = { title: 'Kaggle Learn', provider: 'Kaggle', resourceType: 'Course', url: 'https://www.kaggle.com/learn' }
  const model = createRoadmapPdfModel({
    learner: { goal: roadmap.goal, level: 'Beginner', hours: 8 }, roadmap, strategy: 'balanced',
    progress: { percentage: 25, completedCount: 1, totalCount: 4 }, currentPhase: 1,
    generatedAt: '2026-07-15T00:00:00.000Z', resourcesByPhase: { 1: [resource] },
  })

  assert.equal(model.cover.strategy, 'Balanced')
  assert.equal(model.summary.progress.percentage, 25)
  assert.equal(model.phases[0].project.title, project.title)
  assert.equal(model.phases[0].resources[0].url, resource.url)
})
