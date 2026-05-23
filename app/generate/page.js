'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'

const Logo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#2563eb"/>
    <text x="16" y="23" textAnchor="middle" fontSize="18" fontWeight="900" fontFamily="Arial,sans-serif" fill="white">A</text>
  </svg>
)


function GeneratePageInner() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('scores')
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    platform: 'tiktok',
    contentType: 'educational',
    script: '',
    concept: '',
    targetAudience: '',
    duration: '30-60',
    niche: '',
    hasHook: true
  })

  const COLOR = '#ec4899'

  useEffect(() => {
    const match = document.cookie.match(/cli_user=([^;]+)/)
    if (match) {
      try { setUser(JSON.parse(decodeURIComponent(match[1]))) } catch(e) {}
    }
  }, [])

  const handleAnalyse = async () => {
    if (!form.script && !form.concept) {
      setError('Please enter your script or video concept')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const token = document.cookie.match(/cli_token=([^;]+)/)?.[1] || ''
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...form, userId: user?.id })
      })
      const data = await res.json()
      if (data.error === 'limit_reached') { setError('limit_reached'); setLoading(false); return }
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
      setActiveTab('scores')
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  const inputStyle = { width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:13, outline:'none', boxSizing:'border-box', background:'#fff' }
  const labelStyle = { fontSize:12, fontWeight:600, color:'#475569', marginBottom:4, display:'block' }

  const scoreColor = (score) => {
    if (score >= 80) return '#16a34a'
    if (score >= 60) return '#d97706'
    return '#dc2626'
  }

  const ScoreBar = ({ label, score, description }) => (
    <div style={{marginBottom:12}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
        <span style={{fontSize:12,fontWeight:600,color:'#475569'}}>{label}</span>
        <span style={{fontSize:13,fontWeight:800,color:scoreColor(score)}}>{score}/100</span>
      </div>
      <div style={{background:'#f1f5f9',borderRadius:6,height:6,marginBottom:4}}>
        <div style={{background:scoreColor(score),borderRadius:6,height:6,width:`${score}%`,transition:'width 0.5s'}}/>
      </div>
      {description && <div style={{fontSize:11,color:'#94a3b8'}}>{description}</div>}
    </div>
  )

  if (error === 'limit_reached') return (
    <div style={{minHeight:'100vh',background:'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:'Inter,Arial,sans-serif'}}>
      <div style={{background:'#fff',borderRadius:16,padding:32,maxWidth:400,textAlign:'center',border:'1px solid #e2e8f0'}}>
        <div style={{fontSize:40,marginBottom:16}}>🎬</div>
        <h2 style={{fontSize:18,fontWeight:800,color:'#0f172a',marginBottom:8}}>Free limit reached</h2>
        <p style={{fontSize:14,color:'#64748b',marginBottom:24}}>Upgrade to keep analysing your videos.</p>
        <Link href="/billing" style={{display:'block',background:COLOR,color:'#fff',padding:'12px 24px',borderRadius:9,textDecoration:'none',fontWeight:700,fontSize:14,marginBottom:12}}>Upgrade now →</Link>
        <button onClick={() => setError('')} style={{background:'none',border:'none',color:'#94a3b8',fontSize:13,cursor:'pointer'}}>Maybe later</button>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,Arial,sans-serif'}}>
      <div style={{background:'#fff',borderBottom:'1px solid #e2e8f0',padding:'14px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link href="/dashboard" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <Logo size={28}/>
          <span style={{fontSize:14,fontWeight:800,color:'#0f172a'}}>ClipMetrics</span>
        </Link>
        <Link href="/dashboard" style={{fontSize:13,color:'#64748b',textDecoration:'none'}}>← Dashboard</Link>
      </div>

      <div style={{maxWidth:980,margin:'0 auto',padding:'24px 16px'}}>
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:22,fontWeight:800,color:'#0f172a',marginBottom:6}}>Analyse your video before you post</h1>
          <p style={{fontSize:14,color:'#64748b'}}>Paste your script or describe your concept — get a virality score and specific tips to improve it.</p>
        </div>

        <div style={{display:'grid',gridTemplateColumns: result ? 'clamp(300px,45%,480px) 1fr' : '1fr',gap:24}}>
          {/* Form */}
          <div style={{background:'#fff',borderRadius:14,border:'1px solid #e2e8f0',padding:24}}>
            <h2 style={{fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:20}}>Video Details</h2>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
              <div>
                <label style={labelStyle}>Platform</label>
                <select style={inputStyle} value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}>
                  <option value="tiktok">🎵 TikTok</option>
                  <option value="reels">📸 Instagram Reels</option>
                  <option value="shorts">▶️ YouTube Shorts</option>
                  <option value="facebook">👥 Facebook Video</option>
                  <option value="twitter">🐦 X / Twitter</option>
                  <option value="linkedin">💼 LinkedIn</option>
                  <option value="pinterest">📌 Pinterest</option>
                  <option value="snapchat">👻 Snapchat</option>
                  <option value="all">📱 All Platforms</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Content Type</label>
                <select style={inputStyle} value={form.contentType} onChange={e => setForm({...form, contentType: e.target.value})}>
                  <option value="educational">📚 Educational</option>
                  <option value="entertainment">🎭 Entertainment</option>
                  <option value="tutorial">🛠 Tutorial / How-to</option>
                  <option value="storytime">📖 Storytime</option>
                  <option value="product">🛍 Product / Review</option>
                  <option value="motivational">💪 Motivational</option>
                  <option value="trending">🔥 Trending / Viral</option>
                  <option value="ugc">🎥 UGC / Brand</option>
                </select>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
              <div>
                <label style={labelStyle}>Video Duration</label>
                <select style={inputStyle} value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}>
                  <option value="under-15">Under 15 sec</option>
                  <option value="15-30">15-30 sec</option>
                  <option value="30-60">30-60 sec</option>
                  <option value="60-90">60-90 sec</option>
                  <option value="90-180">90 sec - 3 min</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Niche / Topic</label>
                <input style={inputStyle} placeholder="e.g. personal finance, fitness" value={form.niche}
                  onChange={e => setForm({...form, niche: e.target.value})} />
              </div>
            </div>

            <div style={{marginBottom:14}}>
              <label style={labelStyle}>Target Audience</label>
              <input style={inputStyle} placeholder="e.g. 18-25 year old women interested in skincare" value={form.targetAudience}
                onChange={e => setForm({...form, targetAudience: e.target.value})} />
            </div>

            <div style={{marginBottom:14}}>
              <label style={labelStyle}>Video Script</label>
              <textarea style={{...inputStyle, height:120, resize:'vertical'}}
                placeholder="Paste your full script here including hook, body and CTA..."
                value={form.script} onChange={e => setForm({...form, script: e.target.value})} />
            </div>

            <div style={{marginBottom:20}}>
              <label style={labelStyle}>Or describe your concept</label>
              <textarea style={{...inputStyle, height:70, resize:'vertical'}}
                placeholder="e.g. A video about 3 money mistakes people make in their 20s, starting with a shocking stat..."
                value={form.concept} onChange={e => setForm({...form, concept: e.target.value})} />
            </div>

            {error && error !== 'limit_reached' && (
              <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:12,marginBottom:16,fontSize:13,color:'#dc2626'}}>{error}</div>
            )}

            <button onClick={handleAnalyse} disabled={loading}
              style={{width:'100%',background:loading ? '#f9a8d4' : COLOR,color:'#fff',border:'none',borderRadius:9,padding:'13px 24px',fontSize:14,fontWeight:700,cursor:loading?'not-allowed':'pointer'}}>
              {loading ? '🔍 Analysing...' : '🎬 Analyse Video'}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div style={{background:'#fff',borderRadius:14,border:'1px solid #e2e8f0',padding:24}}>
              <h2 style={{fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:4}}>Video Analysis</h2>
              <p style={{fontSize:12,color:'#94a3b8',marginBottom:16}}>{result.platform} · {result.contentType}</p>

              {/* Overall score */}
              {result.overallScore && (
                <div style={{background: result.overallScore >= 80 ? '#f0fdf4' : result.overallScore >= 60 ? '#fff7ed' : '#fef2f2',
                  border:`1px solid ${result.overallScore >= 80 ? '#bbf7d0' : result.overallScore >= 60 ? '#fed7aa' : '#fecaca'}`,
                  borderRadius:10,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontSize:28,fontWeight:800,color:scoreColor(result.overallScore)}}>{result.overallScore}/100</div>
                    <div style={{fontSize:12,color:'#64748b'}}>Virality Score</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:14,fontWeight:700,color:'#0f172a'}}>{result.verdict}</div>
                    <div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>Overall verdict</div>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div style={{display:'flex',gap:6,marginBottom:16,borderBottom:'1px solid #f1f5f9',paddingBottom:8,flexWrap:'wrap'}}>
                {[
                  {key:'scores', label:'📊 Scores'},
                  {key:'improvements', label:'✏️ Improve'},
                  {key:'hook', label:'🎣 Hook'},
                  {key:'tips', label:'💡 Tips'},
                ].map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    style={{padding:'6px 10px',borderRadius:6,border:'none',fontSize:11,fontWeight:600,cursor:'pointer',
                      background:activeTab===tab.key ? COLOR : '#f1f5f9',
                      color:activeTab===tab.key ? '#fff' : '#64748b'}}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'scores' && result.scores && (
                <div>
                  <ScoreBar label="Hook Strength" score={result.scores.hook} description="How compelling are the first 3 seconds" />
                  <ScoreBar label="Retention" score={result.scores.retention} description="Will viewers watch to the end" />
                  <ScoreBar label="Engagement Potential" score={result.scores.engagement} description="Likes, comments, shares likelihood" />
                  <ScoreBar label="CTA Effectiveness" score={result.scores.cta} description="How strong is the call to action" />
                  <ScoreBar label="Trend Alignment" score={result.scores.trend} description="How well it fits current platform trends" />
                </div>
              )}

              {activeTab === 'improvements' && result.improvements && (
                <div>
                  {result.improvements.map((imp, i) => (
                    <div key={i} style={{marginBottom:12,padding:'10px 12px',background:'#fdf4ff',borderRadius:8,border:'1px solid #f0abfc'}}>
                      <div style={{fontSize:12,fontWeight:700,color:'#a21caf',marginBottom:4}}>#{i+1} {imp.area}</div>
                      <div style={{fontSize:13,color:'#334155',marginBottom:4}}>{imp.issue}</div>
                      <div style={{fontSize:12,color:'#7c3aed',fontWeight:600}}>✓ {imp.fix}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'hook' && (
                <div>
                  {result.hookAnalysis && (
                    <div style={{background:'#f8fafc',borderRadius:8,padding:14,marginBottom:12,fontSize:13,color:'#334155',lineHeight:1.7}}>{result.hookAnalysis}</div>
                  )}
                  {result.alternativeHooks && (
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:'#94a3b8',marginBottom:8}}>ALTERNATIVE HOOKS TO TRY</div>
                      {result.alternativeHooks.map((hook, i) => (
                        <div key={i} style={{padding:'8px 12px',background:'#f0fdf4',borderRadius:6,border:'1px solid #bbf7d0',marginBottom:8,fontSize:13,color:'#15803d',fontStyle:'italic'}}>
                          "{hook}"
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tips' && result.platformTips && (
                <div>
                  {result.platformTips.map((tip, i) => (
                    <div key={i} style={{display:'flex',gap:10,marginBottom:10,alignItems:'flex-start'}}>
                      <span style={{color:COLOR,fontSize:14,flexShrink:0}}>→</span>
                      <span style={{fontSize:13,color:'#334155',lineHeight:1.5}}>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => {
                const txt = `ClipMetrics Analysis\nPlatform: ${result.platform}\nVirality Score: ${result.overallScore}/100\nVerdict: ${result.verdict}\n\nHook: ${result.scores?.hook}/100\nRetention: ${result.scores?.retention}/100\nEngagement: ${result.scores?.engagement}/100`
                navigator.clipboard.writeText(txt)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }} style={{width:'100%',marginTop:16,background:'#f1f5f9',border:'none',borderRadius:8,padding:'10px',fontSize:13,fontWeight:600,color:'#475569',cursor:'pointer'}}>
                {copied ? '✓ Copied!' : '📋 Copy Report'}
              </button>

              <Link href="/dashboard" style={{display:'block',marginTop:10,textAlign:'center',fontSize:13,color:'#94a3b8',textDecoration:'none'}}>View all analyses →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GeneratePage() {
  return <Suspense><GeneratePageInner /></Suspense>
}
