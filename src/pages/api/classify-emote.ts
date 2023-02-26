import { StatusCodes } from 'http-status-codes'

import { config } from '~/config'
import {
  ClassifyEmoteRequest,
  ClassifyEmoteResponse,
  EmoteSource,
} from '~/types/api/classify-emote'

type ClassifyUrlResponse = {
  data: [{ label: string; confidences: { label: string; confidence: number }[] }]
  duration: number
}

type BttvData = {
  user: {
    displayName: string
  }
}

// simple cache for bttv api requests
const bttvCache: Record<string, BttvData> = {}

export default async function handler(req: ClassifyEmoteRequest, res: ClassifyEmoteResponse) {
  const { text } = req.query

  try {
    const response = await fetch(config.server.classifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `access-token=${config.server.classifyUrlToken};`,
      },
      body: JSON.stringify({
        data: [text],
      }),
    })
    if (!response.ok) {
      throw new Error(`Received non-ok status from AI endpoint. ${JSON.stringify(response)}`)
    }

    const data: ClassifyUrlResponse = await response.json()

    res.json({
      data: await Promise.all(
        data.data[0].confidences.map(async ({ label, confidence }) => {
          const [source, emoteName, id] = label.split('__') as [EmoteSource, string, string]

          let emotePageUrl: string
          let emoteImageUrl: string
          let emoteUserDisplayName: string
          if (source === 'twitch-global') {
            emotePageUrl = `https://twitchemotes.com/global/emotes/${id}`
            emoteImageUrl = `https://static-cdn.jtvnw.net/emoticons/v2/${id}/static/light/3.0`
            emoteUserDisplayName = 'Twitch'
          }
          // source must be bttv
          else {
            let bttvData: BttvData
            if (id in bttvCache) {
              bttvData = bttvCache[id]
            } else {
              const bttvResponse = await fetch(`https://api.betterttv.net/3/emotes/${id}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              })
              if (!bttvResponse.ok) {
                throw new Error(`Received non-ok status from BTTV. ${JSON.stringify(response)}`)
              }
              bttvData = await bttvResponse.json()
              bttvCache[id] = bttvData
            }

            emotePageUrl = `https://betterttv.com/emotes/${id}`
            emoteImageUrl = `https://cdn.betterttv.net/emote/${id}/3x.webp`
            emoteUserDisplayName = bttvData.user.displayName
          }

          return {
            source,
            emoteName,
            id,
            emotePageUrl,
            emoteImageUrl,
            user: {
              displayName: emoteUserDisplayName,
            },
            confidence,
          }
        }),
      ),
    })
  } catch (e) {
    console.error(e)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR)
  }
}
