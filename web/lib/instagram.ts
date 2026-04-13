import type { Feed, Post } from '@behold/types'

export type InstagramFeed = {
  username: string
  followersCount: number
  posts: Post[]
}

const EMPTY: InstagramFeed = { username: '', followersCount: 0, posts: [] }

export async function getInstagramFeed(): Promise<InstagramFeed> {
  const feedId = process.env.BEHOLD_FEED_ID
  if (!feedId) {
    throw new Error('BEHOLD_FEED_ID environment variable is not set')
  }

  try {
    const res = await fetch(`https://feeds.behold.so/${feedId}`, {
      next: { revalidate: 3600 },
    })
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
