import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
// Flip is available via gsap core types on Windows (case-sensitivity workaround)
// Register Flip without importing it separately to avoid type casing conflicts
import FlipModule from 'gsap/dist/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const Flip = FlipModule

gsap.registerPlugin(ScrollTrigger, Flip, useGSAP)

export { Flip, gsap, ScrollTrigger, useGSAP }
