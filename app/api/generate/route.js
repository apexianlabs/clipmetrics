import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { platform, contentType, script, concept, targetAudience, duration, niche, userId } = body

    if (!script && !concept) {
      return NextResponse.json({ error: 'Please provide a script or concept' }, { status: 400 })
    }

    if (userId) {
      const usageRes = await fetch(
        `${process.env.DB_API_URL}/usage/check?user_id=${userId}&product=clipmetrics`,
        { headers: { 'Authorization': `Bearer ${process.env.DB_API_KEY_CLIPMETRICS}` } }
      )
      const usage = await usageRes.json()
      if (!usage.allowed) return NextResponse.json({ error: 'limit_reached' }, { status: 403 })
    }

    const platformNames = {
      tiktok: 'TikTok', reels: 'Instagram Reels', shorts: 'YouTube Shorts',
      facebook: 'Facebook Video', twitter: 'X/Twitter', linkedin: 'LinkedIn',
      pinterest: 'Pinterest', snapchat: 'Snapchat', all: 'All Platforms'
    }

    const prompt = `You are an expert social media content strategist who has helped creators grow to millions of followers. Analyse this video content and respond ONLY with valid JSON.

Platform: ${platformNames[platform] || platform}
Content Type: ${contentType}
Duration: ${duration} seconds
${niche ? `Niche: ${niche}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

${script ? `Script:\n${script}` : `Concept:\n${concept}`}

Analyse this content for virality potential on ${platformNames[platform] || platform}. Consider platform-specific best practices, current trends, hook strength, pacing, and engagement triggers.

Respond ONLY with this JSON:
{
  "overallScore": <number 0-100>,
  "verdict": "Viral Potential|Strong Content|Needs Work|Major Revision",
  "scores": {
    "hook": <0-100>,
    "retention": <0-100>,
    "engagement": <0-100>,
    "cta": <0-100>,
    "trend": <0-100>
  },
  "hookAnalysis": "2-3 sentences analysing the hook specifically — is it strong enough to stop the scroll?",
  "alternativeHooks": ["alternative hook 1", "alternative hook 2", "alternative hook 3"],
  "improvements": [
    {"area": "area name", "issue": "what's wrong", "fix": "specific fix"},
    {"area": "area name", "issue": "what's wrong", "fix": "specific fix"},
    {"area": "area name", "issue": "what's wrong", "fix": "specific fix"}
  ],
  "platformTips": [
    "platform-specific tip 1 for ${platformNames[platform] || platform}",
    "tip 2",
    "tip 3",
    "tip 4"
  ],
  "platform": "${platformNames[platform] || platform}",
  "contentType": "${contentType}"
}`

    const aiRes = await fetch(`${process.env.AI_API_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
      body: JSON.stringify({ task: 'analyse_video_content', inputs: { prompt } })
    })

    if (!aiRes.ok) throw new Error('AI analysis failed')

    const aiData = await aiRes.json()
    let result = aiData.data || aiData.result || {}

    try {
      if (typeof result === 'string') {
        const clean = result.replace(/```json|```/g, '').trim()
        result = JSON.parse(clean.match(/\{[\s\S]*\}/)?.[0] || clean)
      } else if (result.raw_response) {
        const clean = result.raw_response.replace(/```json|```/g, '').trim()
        result = JSON.parse(clean.match(/\{[\s\S]*\}/)?.[0] || clean)
      }
    } catch(e) {}

    if (userId) {
      await fetch(`${process.env.DB_API_URL}/db/clipmetrics/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DB_API_KEY_CLIPMETRICS}` },
        body: JSON.stringify({
          user_id: userId,
          title: `${platformNames[platform]} · ${contentType} · ${result.overallScore}/100`,
          result_data: { ...result, platform, contentType, duration, niche, targetAudience },
          status: 'active'
        })
      })
      await fetch(`${process.env.DB_API_URL}/usage/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DB_API_KEY_CLIPMETRICS}` },
        body: JSON.stringify({ user_id: userId, product: 'clipmetrics', action: 'analyse_video_content' })
      })
    }

    return NextResponse.json(result)
  } catch(err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
