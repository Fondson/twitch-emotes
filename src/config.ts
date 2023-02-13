const publicConfig: {
  ackeeUrl: string
  ackeeDomainId: string
} = JSON.parse(process.env.NEXT_PUBLIC_CONFIG || `{}`)

const serverConfig: {
  classifyUrl: string
  classifyUrlToken: string
} = JSON.parse(process.env.SERVER_CONFIG || `{}`)

export const config = {
  ...publicConfig,
  server: serverConfig,
}
