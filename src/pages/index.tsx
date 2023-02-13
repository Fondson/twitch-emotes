import {
  Accordion,
  ActionIcon,
  Alert,
  Box,
  Button,
  Loader,
  Paper,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useScrollIntoView } from '@mantine/hooks'
import { IconAlertCircle, IconArrowRight, IconBrandGithub, IconSend } from '@tabler/icons-react'
import * as cheerio from 'cheerio'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useState } from 'react'

import { ClassifyEmoteQuery, ClassifyEmoteReponseData } from '~/types/api/classify-emote'

type EmotesInfo = Record<string, { imageLink: string; link: string }>

type HomeProps = {
  emotesInfo: EmotesInfo
}

export default function Home(props: HomeProps) {
  const { emotesInfo } = props

  const { scrollIntoView: scrollTextInputIntoView, targetRef: textInputHeadingRef } =
    useScrollIntoView<HTMLHeadingElement>()

  const [prevEmoteDescription, setPrevEmoteDescription] = useState<string>()
  const [emoteDescription, setEmoteDescription] = useState('')
  const [preds, setPreds] = useState<ClassifyEmoteReponseData['data']>()
  const [classifyError, setClassifyError] = useState(false)
  const [isClassifyLoading, setIsClassifyLoading] = useState(false)

  const classifyEmoteWithText = async (text: string) => {
    if (isClassifyLoading || !text) return

    setClassifyError(false)
    setIsClassifyLoading(true)

    try {
      const response = await fetch(
        `/api/classify-emote?${new URLSearchParams({
          text,
        } satisfies ClassifyEmoteQuery)}`,
        {
          method: 'GET',
        },
      )
      if (!response.ok) {
        throw new Error(
          `Received non-ok status from classify endpoint. ${JSON.stringify(response)}`,
        )
      }

      const data: ClassifyEmoteReponseData = await response.json()

      setPreds(data.data)
      setPrevEmoteDescription(emoteDescription)
      setEmoteDescription('')
    } catch {
      setClassifyError(true)
    }

    setIsClassifyLoading(false)
  }

  return (
    <>
      <Head>
        <title>Twitch Emotes Finder</title>
        <meta name="description" content="What was that Twitch emote called again?" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box sx={(theme) => ({ display: 'flex', flexDirection: 'column', height: '100vh' })}>
        <Box
          component="main"
          sx={(theme) => ({ flexGrow: 1, padding: `${theme.spacing.lg}px ${theme.spacing.md}px` })}
        >
          <Box
            sx={(theme) => ({
              maxWidth: `1140px`,
              margin: '0 auto',
            })}
          >
            <Box
              sx={(theme) => ({
                display: 'flex',
                flexDirection: 'column',
                margin: `${theme.spacing.sm}px 0`,
              })}
            >
              <Title ref={textInputHeadingRef} order={1}>
                {'What does your emote look like?'}
              </Title>
              <Text>{'Find a Twitch emote that matches your description'}</Text>
              <TextInput
                placeholder={prevEmoteDescription ?? 'Emote description'}
                value={emoteDescription}
                onChange={(event) => setEmoteDescription(event.currentTarget.value)}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') {
                    classifyEmoteWithText(emoteDescription)
                  }
                }}
                sx={(theme) => ({ margin: `${theme.spacing.sm}px 0px` })}
                rightSection={
                  isClassifyLoading ? (
                    <Loader size="xs" />
                  ) : (
                    <ActionIcon
                      onClick={() => classifyEmoteWithText(emoteDescription)}
                      size="xs"
                      variant="transparent"
                    >
                      <IconSend />
                    </ActionIcon>
                  )
                }
              />

              <Box>
                {classifyError ? (
                  <Alert
                    title="Error 😔"
                    color="red"
                    icon={<IconAlertCircle size={16} />}
                    sx={(theme) => ({ margin: `${theme.spacing.sm}px 0` })}
                  >
                    {
                      'This site runs on free resources. There might be trouble handling the current load'
                    }
                  </Alert>
                ) : preds ? (
                  <>
                    <Title order={2} sx={(theme) => ({ margin: `${theme.spacing.sm}px 0` })}>
                      {'Were you thinking of these emotes?'}
                    </Title>
                    <Box
                      sx={(theme) => ({
                        flexGrow: 1,
                        flexWrap: 'wrap',
                        display: 'flex',
                        gap: theme.spacing.sm,
                        overflowY: 'auto',
                      })}
                    >
                      {preds.map(({ label }) => {
                        if (emotesInfo[label]?.imageLink == null) {
                          return null
                        }

                        return (
                          <Paper
                            key={label}
                            component="a"
                            target="_blank"
                            href={emotesInfo[label].link}
                            sx={(theme) => ({
                              display: 'flex',
                              flexDirection: 'column',
                              border: `1px solid ${theme.colors.dark[6]}`,
                              borderRadius: theme.radius.lg,
                              backgroundColor: theme.colors.dark[8],
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '146px',
                              padding: theme.spacing.md,
                            })}
                          >
                            <Box
                              sx={(theme) => ({
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '112px',
                                height: '112px',
                                marginBottom: theme.spacing.xs,
                              })}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={emotesInfo[label].imageLink} alt={`${label}`} />
                            </Box>
                            <Text
                              truncate
                              align="center"
                              sx={() => ({ width: '100%' })}
                              title={label}
                            >
                              {label}
                            </Text>
                          </Paper>
                        )
                      })}
                    </Box>
                  </>
                ) : (
                  <>
                    <Title order={2} sx={(theme) => ({ margin: `${theme.spacing.sm}px 0` })}>
                      {'Examples'}
                    </Title>
                    <Box
                      sx={(theme) => ({
                        flexWrap: 'wrap',
                        display: 'flex',
                        gap: theme.spacing.sm,
                      })}
                    >
                      {["turkey with man's face", 'anime girl waving hi', 'crying pink blob'].map(
                        (example) => {
                          return (
                            <Button
                              key={example}
                              color="dark"
                              rightIcon={<IconArrowRight size={16} />}
                              onClick={() => {
                                setEmoteDescription(example)
                                scrollTextInputIntoView()
                              }}
                            >{`"${example}"`}</Button>
                          )
                        },
                      )}
                    </Box>
                  </>
                )}
              </Box>

              <Box sx={(theme) => ({ margin: `${theme.spacing.sm}px 0` })}>
                <Accordion>
                  <Accordion.Item value="motivation">
                    <Accordion.Control>
                      <Title order={2}>{'Need some motivation?'}</Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text sx={(theme) => ({ marginBottom: `${theme.spacing.sm}px` })}>
                        {'Figure out the names of these emotes'}
                      </Text>
                      <Box
                        sx={(theme) => ({
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: theme.spacing.sm,
                        })}
                      >
                        {['PunOko', 'Kappa', 'KomodoHype', 'Jebaited', 'NotLikeThis'].map(
                          (label) => {
                            return (
                              <Paper
                                key={label}
                                sx={(theme) => ({
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  border: `1px solid ${theme.colors.dark[6]}`,
                                  borderRadius: theme.radius.lg,
                                  backgroundColor: theme.colors.dark[8],
                                  width: '146px',
                                  padding: theme.spacing.md,
                                })}
                              >
                                <Box
                                  sx={(theme) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '112px',
                                    height: '112px',
                                  })}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={emotesInfo[label].imageLink} alt={`${label}`} />
                                </Box>
                              </Paper>
                            )
                          },
                        )}
                      </Box>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={(theme) => ({ padding: theme.spacing.md })}>
          <Box
            sx={(theme) => ({
              maxWidth: `1140px`,
              margin: '0 auto',
            })}
          >
            <Box sx={() => ({ display: 'flex' })}>
              <Box sx={() => ({ marginLeft: 'auto' })}>
                <ActionIcon
                  size="xl"
                  variant="outline"
                  radius="xl"
                  component="a"
                  href="https://github.com/Fondson/twitch-emotes"
                  target="_blank"
                >
                  <IconBrandGithub size={34} />
                </ActionIcon>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const simpleUnescape = (htmlStr: string) => {
    htmlStr = htmlStr.replace(/&lt;/g, '<')
    htmlStr = htmlStr.replace(/&gt;/g, '>')
    htmlStr = htmlStr.replace(/&quot;/g, '"')
    htmlStr = htmlStr.replace(/&#39;/g, "'")
    htmlStr = htmlStr.replace(/&amp;/g, '&')
    return htmlStr
  }

  const res = await fetch('https://twitchemotes.com/')
  const $ = cheerio.load(await res.text())
  const emoteEls = $('.emote-name')
    .toArray()
    .sort((el1, el2) => {
      const hrefParts1 = $(el1).attr('href')?.split('/')
      const hrefParts2 = $(el2).attr('href')?.split('/')

      return (
        parseInt(hrefParts1?.[hrefParts1.length - 1] ?? '0', 10) -
        parseInt(hrefParts2?.[hrefParts2.length - 1] ?? '0', 10)
      )
    })

  const emotesInfo = emoteEls.reduce((prev, emoteEl) => {
    const emoteElText = (emoteEl as cheerio.TagElement).nextSibling as cheerio.TagElement
    return {
      [simpleUnescape(emoteElText.nodeValue.trim())]: {
        imageLink: $(emoteEl).children('img').attr('src')?.replace('1.0', '3.0') ?? '',
        link: `https://twitchemotes.com${$(emoteEl).attr('href')}`,
      },
      ...prev,
    }
  }, {} as EmotesInfo)

  return {
    props: { emotesInfo },
  }
}
