import { StatusCodes } from 'http-status-codes'

import { config } from '~/config'
import { ClassifyEmoteRequest, ClassifyEmoteResponse } from '~/types/api/classify-emote'

type ClassifyUrlResponse = {
  data: [{ label: string; confidences: { label: string; confidence: number }[] }]
  duration: number
}

export default async function handler(req: ClassifyEmoteRequest, res: ClassifyEmoteResponse) {
  const { text } = req.query

  try {
    const response = await fetch(config.classifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [text],
      }),
    })
    if (!response.ok) {
      throw new Error(`Received non-ok status from AI endpoint. ${JSON.stringify(response)}`)
    }

    const data: ClassifyUrlResponse = await response.json()

    res.json({ data: data.data[0].confidences })
  } catch (e) {
    console.error(e)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR)
  }
}
