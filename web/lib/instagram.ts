import type { Feed, Post } from '@behold/types'

export async function getInstagramPosts(): Promise<Post[]> {
  const feedId = process.env.BEHOLD_FEED_ID
  if (!feedId) {
    throw new Error('BEHOLD_FEED_ID environment variable is not set')
  }

  try {
    const res = await fetch(`https://feeds.behold.so/${feedId}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const feed: Feed = await res.json()
    return feed.posts ?? []
  } catch {
    return []
  }
}
