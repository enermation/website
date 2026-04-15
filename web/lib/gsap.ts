import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
// Flip is available via gsap core types on Windows (case-sensitivity workaround)
// Register Flip without importing it separately to avoid type casing conflicts
import FlipModule from 'gsap/dist/Flip'
import { EasePack } from 'gsap/EasePack'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const Flip = FlipModule

gsap.registerPlugin(ScrollTrigger, Flip, useGSAP, CustomEase, EasePack)

export { CustomEase, Flip, gsap, ScrollTrigger, useGSAP }
