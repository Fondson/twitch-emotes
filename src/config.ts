const publicConfig: {
  classifyUrl: string
} = JSON.parse(process.env.NEXT_PUBLIC_CONFIG || `{}`)

export const config = {
  ...publicConfig,
}
