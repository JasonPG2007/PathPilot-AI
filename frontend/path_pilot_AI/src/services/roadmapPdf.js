import { jsPDF } from 'jspdf'

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN = 18
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const FOOTER_TOP = 280
const INK = [35, 37, 52]
const MUTED = [101, 106, 124]
const PRIMARY = [103, 83, 213]
const RULE = [225, 224, 235]

function clean(value) {
  return String(value ?? 'Not provided').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim()
}

function strategyName(strategy) {
  return { fast: 'Fast Track', balanced: 'Balanced', deep: 'Deep Mastery' }[strategy] || clean(strategy)
}

function safeList(value) {
  return Array.isArray(value) && value.length ? value : ['None specified']
}

export function createRoadmapPdfModel({ learner, roadmap, strategy, progress, currentPhase, generatedAt, resourcesByPhase, dashboard, achievements = [] }) {
  const review = roadmap.criticReview || {}
  const earnedAchievements = achievements.filter((badge) => badge.earned).sort((left, right) => Date.parse(right.earnedAt) - Date.parse(left.earnedAt))
  return {
    cover: {
      goal: roadmap.goal || learner.goal,
      startingLevel: roadmap.startingLevel || learner.level,
      weeklyHours: roadmap.weeklyHours ?? learner.hours,
      timeline: roadmap.timeline || learner.timeline,
      strategy: strategyName(strategy),
      feasibilityScore: roadmap.feasibilityScore,
      generatedAt: generatedAt || new Date().toISOString(),
    },
    summary: {
      coach: roadmap.coachSummary,
      review: {
        riskLevel: review.riskLevel,
        issues: review.issues || review.issuesFound || [],
        changes: review.changesMade || [],
        timeline: review.timelineAdjustments,
        prerequisites: review.prerequisiteCorrections,
      },
      progress,
      currentPhase,
      dashboard: dashboard ?? {
        remainingCount: Math.max(0, progress.totalCount - progress.completedCount),
        strategy: strategyName(strategy),
        estimatedFinish: { label: 'Not provided' },
        nextAction: { title: 'Not provided' },
        currentPhase,
      },
      achievements: earnedAchievements,
    },
    phases: roadmap.phases.map((phase) => ({
      ...phase,
      project: phase.recommendedProject || phase.project,
      resources: resourcesByPhase?.[phase.id] || [],
    })),
  }
}

function createWriter(doc) {
  let y = MARGIN

  function pageBreak(required = 12) {
    if (y + required > FOOTER_TOP) {
      doc.addPage()
      y = MARGIN
    }
  }

  function text(value, options = {}) {
    const { size = 10, bold = false, color = INK, indent = 0, gap = 3, lineHeight = 1.35 } = options
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(clean(value), CONTENT_WIDTH - indent)
    const height = lines.length * size * 0.3528 * lineHeight
    pageBreak(height + gap)
    doc.text(lines, MARGIN + indent, y)
    y += height + gap
  }

  function heading(value, level = 2) {
    pageBreak(level === 1 ? 22 : 14)
    text(value, { size: level === 1 ? 20 : 13, bold: true, color: level === 1 ? INK : PRIMARY, gap: 4 })
    doc.setDrawColor(...RULE)
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
    y += 5
  }

  function labelValue(label, value) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const lines = doc.splitTextToSize(clean(value), CONTENT_WIDTH - 48)
    const height = Math.max(7, lines.length * 4.8)
    pageBreak(height + 2)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(clean(label).toUpperCase(), MARGIN, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    doc.text(lines, MARGIN + 48, y)
    y += height
  }

  function bullets(items) {
    for (const item of safeList(items)) {
      pageBreak(8)
      doc.setFillColor(...PRIMARY)
      doc.circle(MARGIN + 1.5, y - 1.3, 0.8, 'F')
      text(item, { indent: 5, size: 9.5, color: MUTED, gap: 2 })
    }
  }

  return { get y() { return y }, set y(value) { y = value }, pageBreak, text, heading, labelValue, bullets }
}

function addCover(doc, model) {
  doc.setFillColor(249, 248, 253)
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F')
  doc.setFillColor(...PRIMARY)
  doc.roundedRect(MARGIN, 24, 13, 13, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('P', MARGIN + 4.2, 33)
  doc.setTextColor(...INK)
  doc.setFontSize(15)
  doc.text('PathPilot AI', MARGIN + 18, 33)

  doc.setTextColor(...PRIMARY)
  doc.setFontSize(9)
  doc.text('PERSONALIZED LEARNING ROADMAP', MARGIN, 67)
  doc.setTextColor(...INK)
  doc.setFontSize(28)
  const title = doc.splitTextToSize(clean(model.cover.goal), CONTENT_WIDTH)
  doc.text(title, MARGIN, 83)
  const titleBottom = 83 + title.length * 11
  doc.setTextColor(...MUTED)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text('A focused, adaptive path from your current level to your target role.', MARGIN, titleBottom + 8)

  const rows = [
    ['Starting level', model.cover.startingLevel],
    ['Weekly availability', `${model.cover.weeklyHours} hours/week`],
    ['Target timeline', model.cover.timeline],
    ['Strategy', model.cover.strategy],
    ['Feasibility score', `${model.cover.feasibilityScore}%`],
    ['Generated', new Date(model.cover.generatedAt).toLocaleDateString()],
  ]
  let y = Math.max(150, titleBottom + 30)
  for (const [label, value] of rows) {
    doc.setDrawColor(...RULE)
    doc.line(MARGIN, y + 6, PAGE_WIDTH - MARGIN, y + 6)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(label.toUpperCase(), MARGIN, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    doc.text(clean(value), 82, y)
    y += 16
  }
}

function addSummary(doc, model) {
  doc.addPage()
  const writer = createWriter(doc)
  writer.heading('AI Coach Insights', 1)
  writer.labelValue('Strengths', model.summary.coach?.strengths)
  writer.labelValue('Biggest challenge', model.summary.coach?.biggestChallenge)
  writer.labelValue('Recommended strategy', model.summary.coach?.recommendedStrategy)
  writer.labelValue('Next advice', model.summary.coach?.nextAdvice)
  writer.heading('Journey Dashboard')
  writer.labelValue('Completion', `${model.summary.progress.percentage}%`)
  writer.labelValue('Completed / remaining', `${model.summary.progress.completedCount} / ${model.summary.dashboard.remainingCount}`)
  writer.labelValue('Current phase', `${model.summary.dashboard.currentPhase} of ${model.phases.length}`)
  writer.labelValue('Strategy', model.summary.dashboard.strategy)
  writer.labelValue('Estimated finish', model.summary.dashboard.estimatedFinish.label)
  writer.labelValue('Next milestone', model.summary.dashboard.nextAction.title)
  writer.heading('Achievements')
  writer.labelValue('Earned badges', `${model.summary.achievements.length}`)
  writer.labelValue('Badge titles', model.summary.achievements.map((badge) => badge.title).join(', ') || 'None yet')
  writer.labelValue('Latest badge', model.summary.achievements[0]?.title ?? 'None yet')
  writer.heading('Roadmap Summary', 1)
  writer.labelValue('Progress', `${model.summary.progress.percentage}% complete`)
  writer.labelValue('Completion', `${model.summary.progress.completedCount} of ${model.summary.progress.totalCount} items`)
  writer.labelValue('Current phase', `${model.summary.currentPhase} of ${model.phases.length}`)
  writer.labelValue('Critic risk level', model.summary.review.riskLevel)
  writer.heading('Critic Review')
  writer.text('Issues identified', { bold: true, size: 10 })
  writer.bullets(model.summary.review.issues)
  writer.text('Changes made', { bold: true, size: 10 })
  writer.bullets(model.summary.review.changes)
  writer.labelValue('Timeline adjustment', model.summary.review.timeline)
  writer.labelValue('Prerequisite correction', model.summary.review.prerequisites)
}

function addPhase(doc, phase, phaseNumber) {
  doc.addPage()
  const writer = createWriter(doc)
  writer.text(`PHASE ${phaseNumber}`, { size: 8, bold: true, color: PRIMARY })
  writer.heading(phase.title, 1)
  writer.labelValue('Duration', phase.duration)
  writer.labelValue('Weekly workload', phase.weeklyWorkload)
  writer.text(phase.description, { size: 10.5, color: MUTED, gap: 6 })
  writer.heading('Prerequisites')
  writer.bullets(phase.prerequisites)
  writer.heading('Skills')
  writer.bullets(phase.skills)
  writer.heading('Milestones')
  writer.bullets(phase.milestones)
  writer.heading('Recommended Project')
  writer.text(phase.project?.title, { bold: true, size: 11 })
  if (phase.project?.description) writer.text(phase.project.description, { color: MUTED })
  if (phase.project?.type || phase.project?.category) writer.labelValue('Type', phase.project.type || phase.project.category)
  writer.heading('Recommended Resources')
  if (!phase.resources.length) {
    writer.text('No matched resources are available for this phase.', { color: MUTED })
  } else {
    for (const resource of phase.resources) {
      writer.text(resource.title, { bold: true, size: 10.5, gap: 1 })
      writer.text(`${resource.provider} | ${resource.resourceType}`, { size: 9, color: MUTED, gap: 1 })
      writer.text(resource.url, { size: 8.5, color: PRIMARY, gap: 4 })
    }
  }
}

function addFooters(doc, date) {
  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setDrawColor(...RULE)
    doc.line(MARGIN, FOOTER_TOP, PAGE_WIDTH - MARGIN, FOOTER_TOP)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(`Generated by PathPilot AI | ${date}`, MARGIN, 287)
    doc.text(`Page ${page} of ${pageCount}`, PAGE_WIDTH - MARGIN, 287, { align: 'right' })
  }
}

export async function downloadRoadmapPdf(input) {
  const model = createRoadmapPdfModel(input)
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
  addCover(doc, model)
  addSummary(doc, model)
  model.phases.forEach((phase, index) => addPhase(doc, phase, index + 1))
  const currentDate = new Date().toLocaleDateString()
  addFooters(doc, currentDate)
  const fileGoal = clean(model.cover.goal).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
  doc.save(`pathpilot-${fileGoal || 'roadmap'}.pdf`)
}
