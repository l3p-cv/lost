import { useEffect, useState } from 'react'

/**
 * returns the seconds since the last user activity
 */
const useInactive = () => {
  const [inactiveSeconds, setInactiveSeconds] = useState<number>(0)
  useEffect(() => {
    const countInactiveSecondsInterval = setInterval(
      () => setInactiveSeconds((prev) => prev + 1),
      1000,
    )
    const resetInactiveSeconds = () => {
      setInactiveSeconds(0)
    }

    const events = ['load', 'mousemove', 'mousedown', 'click', 'scroll', 'keypress']

    for (const event of events) globalThis.addEventListener(event, resetInactiveSeconds)

    return () => {
      clearInterval(countInactiveSecondsInterval)

      for (const event of events)
        globalThis.removeEventListener(event, resetInactiveSeconds)
    }
  }, [])
  return inactiveSeconds
}

export default useInactive
