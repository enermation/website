import type { Feed, Post } from '@behold/types'
import { cacheLife } from 'next/cache'

export type InstagramFeed = {
  username: string
  followersCount: number
  posts: Post[]
}

const EMPTY: InstagramFeed = { username: '', followersCount: 0, posts: [] }

export async function getInstagramFeed(): Promise<InstagramFeed> {
  'use cache'
  cacheLife('hours')

  const feedId = process.env.BEHOLD_FEED_ID
  if (!feedId) return EMPTY

  try {
    const res = await fetch(`https://feeds.behold.so/${feedId}`)
    if (!res.ok) return EMPTY
    const feed: Feed = await res.json()
    return {
      username: feed.username ?? '',
      followersCount: feed.followersCount ?? 0,
      posts: feed.posts ?? [],
    }
  } catch {
    return EMPTY
  }
}
