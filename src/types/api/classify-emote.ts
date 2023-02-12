import type { NextApiRequest, NextApiResponse } from 'next'

type ClassifyEmoteQuery = {
  text: string
}

interface ClassifyEmoteRequest extends NextApiRequest {
  query: ClassifyEmoteQuery
}

type ClassifyEmoteReponseData = {
  data: { label: string; confidence: number }[]
}

type ClassifyEmoteResponse = NextApiResponse<ClassifyEmoteReponseData>

export type {
  ClassifyEmoteQuery,
  ClassifyEmoteReponseData,
  ClassifyEmoteRequest,
  ClassifyEmoteResponse,
}
