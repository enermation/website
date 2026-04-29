'use client'

import { useEffect, useRef, useState } from 'react'

const GREETINGS: { range: [number, number]; options: string[] }[] = [
  {
    range: [0, 5],
    options: [
      'Late night, great time to browse',
      'The garage is always open',
      'Searching for something specific?',
      'Midnight shopping? We have you covered',
      'After-hours browsing',
      'The lot never closes online',
      'Taking your time? We love that',
    ],
  },
  {
    range: [5, 9],
    options: [
      'Good morning — first to the lot?',
      'Early bird, great taste',
      'Start your search right',
      'Ready to find your next vehicle?',
      'Morning fuel for your car hunt',
      'First one here today',
      'Rise and drive',
    ],
  },
  {
    range: [9, 12],
    options: [
      'Good morning',
      "Let's find your perfect match",
      'What are you driving today?',
      'Ready to explore our inventory?',
      'Shop with confidence',
      'The right vehicle is out there',
      'Every great drive starts with a browse',
    ],
  },
  {
    range: [12, 17],
    options: [
      'Good afternoon',
      'Taking a lunch break to car shop?',
      'Still exploring?',
      "Let's find you something great",
      'Afternoon adventures await',
      "The best cars don't wait",
      "What's caught your eye today?",
    ],
  },
  {
    range: [17, 21],
    options: [
      'Good evening',
      'Evening, car enthusiast',
      'Thinking about a new ride?',
      'Winding down or gearing up?',
      'The evening drive calls',
      'Time to make a move?',
      'End of day car browsing — the best kind',
    ],
  },
  {
    range: [21, 24],
    options: [
      'Good night',
      'Late night browsing — the best deals wait',
      'Almost tomorrow — any questions before you rest?',
      'Quiet hours — perfect for picking the right vehicle',
      'Almost tomorrow — sleep on it or keep browsing',
      'The best decisions are made late at night',
      'Rest up — your next car is worth it',
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
