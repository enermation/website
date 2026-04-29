'use client'

import { useEffect, useRef, useState } from 'react'

const GREETINGS: { range: [number, number]; options: string[] }[] = [
  {
    range: [0, 5],
    options: [
      'Working late?',
      'Burning the midnight oil?',
      'Still up, I see',
      'Late night browsing?',
      'Welcome back',
    ],
  },
  {
    range: [5, 9],
    options: [
      'Good morning',
      'Early riser',
      'Fresh start ahead',
      'Ready to find your next vehicle?',
    ],
  },
  {
    range: [9, 12],
    options: [
      'Good morning',
      "Let's find you something great",
      "What's on your mind today?",
      'Ready to explore?',
    ],
  },
  {
    range: [12, 17],
    options: ['Good afternoon', 'Afternoon vibes', 'Still exploring?', "How's your day going?"],
  },
  {
    range: [17, 21],
    options: [
      'Good evening',
      'Evening, car enthusiast',
      'Thinking about a new ride?',
      'Winding down or gearing up?',
    ],
  },
  {
    range: [21, 24],
    options: [
      'Good night',
      'Late night magic hour',
      'Night mode activated',
      'Quiet hours for the best deals',
    ],
  },
]

function pickGreeting() {
  const hour = new Date().getHours()
  const bucket =
    GREETINGS.find(({ range: [min, max] }) => hour >= min && hour < max) ?? GREETINGS[0]
  return bucket.options[Math.floor(Math.random() * bucket.options.length)]
}

export function useTimeBasedGreeting() {
  const [greeting, setGreeting] = useState<string | null>(null)
  const lastHourRef = useRef(new Date().getHours())

  useEffect(() => {
    setGreeting(pickGreeting())

    const interval = setInterval(() => {
      const hour = new Date().getHours()
      if (hour === lastHourRef.current) return
      lastHourRef.current = hour
      setGreeting(pickGreeting())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return greeting
}
