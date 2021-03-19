import { useEffect, useState } from 'react'

const useInactive = (startTime) => {
    const [timer, setTimer] = useState(startTime)
    useEffect(() => {
        const myInterval = setInterval(() => {
            if (timer > 0) {
                setTimer(timer - 1)
            }
        }, 1000)
        const resetTimeout = () => {
            setTimer(startTime)
        }
        const events = ['load', 'mousemove', 'mousedown', 'click', 'scroll', 'keypress']
        events.forEach((event) => {
            window.addEventListener(event, resetTimeout)
        })
        return () => {
            clearInterval(myInterval)
            events.forEach((event) => {
                window.removeEventListener(event, resetTimeout)
            })
        }
    })
    return timer
}

export default useInactive
