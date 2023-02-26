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
import Head from 'next/head'
import { useState } from 'react'

import { ClassifyEmoteQuery, ClassifyEmoteReponseData } from '~/types/api/classify-emote'

export default function Home() {
  const { scrollIntoView: scrollTextInputIntoView, targetRef: textInputHeadingRef } =
    useScrollIntoView<HTMLHeadingElement>()

  const [prevEmoteDescription, setPrevEmoteDescription] = useState<string>()
  const [emoteDescription, setEmoteDescription] = useState('')
  const [preds, setPreds] = useState<ClassifyEmoteReponseData['data']>()
  const [classifyError, setClassifyError] = useState(false)
  const [isClassifyLoading, setIsClassifyLoading] = useState(false)

  const classifyEmoteWithText = async (text: string) => {
    if (isClassifyLoading || !text) return

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
      setPrevEmoteDescription(text)
      setEmoteDescription('')
      setClassifyError(false)
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
                size="lg"
                rightSection={
                  isClassifyLoading ? (
                    <Loader size="sm" />
                  ) : (
                    <ActionIcon
                      onClick={() => classifyEmoteWithText(emoteDescription)}
                      size="md"
                      variant="transparent"
                    >
                      <IconSend />
                    </ActionIcon>
                  )
                }
                rightSectionWidth="50px"
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
                      {'Were you thinking of one of these emotes?'}
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
                      {preds.map(({ emoteName, emotePageUrl, emoteImageUrl, user }) => {
                        return (
                          <Paper
                            key={emotePageUrl}
                            component="a"
                            target="_blank"
                            href={emotePageUrl}
                            sx={(theme) => ({
                              display: 'flex',
                              flexDirection: 'column',
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
                                marginBottom: theme.spacing.xs,
                              })}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={emoteImageUrl}
                                alt={emoteName}
                                style={{ objectFit: 'scale-down', width: '100%', height: '100%' }}
                              />
                            </Box>
                            <Text
                              align="center"
                              truncate
                              sx={() => ({ width: '100%', lineHeight: 1.05 })}
                              title={emoteName}
                            >
                              {emoteName}
                            </Text>
                            <Text
                              align="center"
                              size="sm"
                              color="dimmed"
                              truncate
                              sx={() => ({ width: '100%' })}
                              title={emoteName}
                            >
                              {user.displayName}
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
                      {[
                        'cartoon hamster dancing',
                        "turkey with man's face",
                        'green frog with credit card',
                      ].map((example) => {
                        return (
                          <Button
                            key={example}
                            color="dark"
                            rightIcon={<IconArrowRight size={16} />}
                            onClick={() => {
                              setEmoteDescription(example)
                              classifyEmoteWithText(example)
                              scrollTextInputIntoView()
                            }}
                          >{`"${example}"`}</Button>
                        )
                      })}
                    </Box>
                  </>
                )}
              </Box>

              <Box sx={(theme) => ({ margin: `${theme.spacing.sm}px 0` })}>
                <Accordion multiple>
                  <Accordion.Item value="motivation">
                    <Accordion.Control>
                      <Title order={2}>{'Need some motivation?'}</Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text sx={(theme) => ({ marginBottom: `${theme.spacing.sm}px` })}>
                        {'Try figuring out the names of these emotes!'}
                      </Text>
                      <Box
                        sx={(theme) => ({
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: theme.spacing.sm,
                        })}
                      >
                        {[
                          'https://static-cdn.jtvnw.net/emoticons/v2/160401/static/light/3.0',
                          'https://cdn.betterttv.net/emote/5ba6d5ba6ee0c23989d52b10/3x.webp',
                          'https://cdn.betterttv.net/emote/5e0fa9d40550d42106b8a489/3x.webp',
                          'https://cdn.betterttv.net/emote/5e2914861df9195f1a4cd411/3x.webp',
                          'https://cdn.betterttv.net/emote/58493695987aab42df852e0f/3x.webp',
                        ].map((url, i) => {
                          return (
                            <Paper
                              key={url}
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
                                <img src={url} alt={`Motivation ${i + 1}`} />
                              </Box>
                            </Paper>
                          )
                        })}
                      </Box>
                    </Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item value="cant-find-emote">
                    <Accordion.Control>
                      <Title order={2}>{"Why can't I find the emote I'm looking for?"}</Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text sx={(theme) => ({ marginBottom: `${theme.spacing.sm}px` })}>
                        <Box component="span">
                          {
                            'This site finds Twitch emotes using a trained AI model. The model is only trained on '
                          }
                        </Box>
                        <a href="https://twitchemotes.com/" target="_blank" rel="noreferrer">
                          global Twitch emotes
                        </a>
                        <Box component="span">{' and the '}</Box>
                        <a
                          href="https://betterttv.com/emotes/popular/"
                          target="_blank"
                          rel="noreferrer"
                        >
                          top 1000~ emotes from BetterTTV
                        </a>
                        <Box component="span">{'.'}</Box>
                      </Text>
                      <Text size="sm">The AI might just be too dumb to find a specific emote.</Text>
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
