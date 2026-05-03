export async function POST(req: Request) {
  const formData = await req.formData()
  const audio = formData.get('audio') as File | null

  if (!audio) {
    return Response.json({ error: 'No audio file provided' }, { status: 400 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'GROQ_API_KEY is not configured' }, { status: 503 })
  }

  const body = new FormData()
  body.append('file', audio, audio.name || 'recording.webm')
  body.append('model', 'whisper-large-v3')
  body.append('response_format', 'json')

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body,
  })

  if (!res.ok) {
    const detail = await res.text()
    return Response.json({ error: detail }, { status: res.status })
  }

  const data = (await res.json()) as { text: string }
  return Response.json({ text: data.text })
}
