const publicConfig: {
  classifyUrl: string
  ackeeUrl: string
  ackeeDomainId: string
} = JSON.parse(process.env.NEXT_PUBLIC_CONFIG || `{}`)

export const config = {
  ...publicConfig,
}
