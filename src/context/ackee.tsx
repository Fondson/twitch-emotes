import * as ackeeTracker from 'ackee-tracker'
import { useRouter } from 'next/router'
import { createContext, ReactElement, ReactNode, useCallback, useEffect, useState } from 'react'

import { config } from '~/config'

const { ackeeUrl, ackeeDomainId } = config

interface IAckeeContext {
  ackeeInstance: ackeeTracker.AckeeInstance | undefined
}

export const AckeeContext = createContext<IAckeeContext>({
  ackeeInstance: undefined,
})

interface AckeeProviderProps {
  children: ReactNode
}

export const AckeeProvider = ({ children }: AckeeProviderProps): ReactElement => {
  const router = useRouter()

  const [ackeeInstance, setAckeeInstance] = useState<ackeeTracker.AckeeInstance>()
  const [lastTrackedUrl, setLastTrackedUrl] = useState('')

  useEffect(() => {
    if (ackeeUrl && ackeeDomainId) {
      setAckeeInstance(
        ackeeTracker.create(ackeeUrl, {
          detailed: true,
          // uncomment below for testing
          // ignoreLocalhost: false,
          // ignoreOwnVisits: false,
        }),
      )
    }
  }, [])

  const track = useCallback(() => {
    const currentUrlToTrack = window.location.href
    if (lastTrackedUrl === currentUrlToTrack || !ackeeInstance || !ackeeDomainId) return

    ackeeInstance.record(ackeeDomainId)
    setLastTrackedUrl(currentUrlToTrack)
  }, [ackeeInstance, lastTrackedUrl])

  useEffect(() => {
    if (router.isReady) {
      track()
    }
  }, [router.isReady, track])

  useEffect(() => {
    router.events.on('routeChangeComplete', track)
    return () => {
      router.events.off('routeChangeComplete', track)
    }
  }, [router.events, track])

  return <AckeeContext.Provider value={{ ackeeInstance }}>{children}</AckeeContext.Provider>
}
