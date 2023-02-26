import type { NextApiRequest, NextApiResponse } from 'next'

type ClassifyEmoteQuery = {
  text: string
}

interface ClassifyEmoteRequest extends NextApiRequest {
  query: ClassifyEmoteQuery
}

type EmoteSource = 'twitch-global' | 'bttv'

type ClassifyEmoteReponseData = {
  data: {
    source: EmoteSource
    emoteName: string
    id: string
    emotePageUrl: string
    emoteImageUrl: string
    user: {
      displayName: string
    }
    confidence: number
  }[]
}

type ClassifyEmoteResponse = NextApiResponse<ClassifyEmoteReponseData>

export type {
  ClassifyEmoteQuery,
  ClassifyEmoteReponseData,
  ClassifyEmoteRequest,
  ClassifyEmoteResponse,
  EmoteSource,
}
