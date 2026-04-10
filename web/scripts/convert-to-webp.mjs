import { readdir, stat, unlink } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMAGES_DIR = join(__dirname, '..', 'public', 'images')

// Resize config per directory
const resizeConfig = {
  '': { maxWidth: 1920, quality: 80 }, // root images (hero, section)
  cars: { maxWidth: 1000, quality: 80 }, // car cards
  instagram: { maxWidth: 500, quality: 75 }, // instagram grid
  news: { maxWidth: 1000, quality: 80 }, // news article
}

async function processDirectory(dirPath, subDir = '') {
  const config = resizeConfig[subDir] || resizeConfig['']
  const entries = await readdir(dirPath)

  for (const entry of entries) {
    const fullPath = join(dirPath, entry)
    const fileStat = await stat(fullPath)

    if (fileStat.isDirectory()) {
      await processDirectory(fullPath, subDir ? `${subDir}/${entry}` : entry)
      continue
    }

    if (!entry.toLowerCase().endsWith('.jpg') && !entry.toLowerCase().endsWith('.jpeg')) {
      continue
    }

    const baseName = basename(entry, '.jpg') || basename(entry, '.jpeg')
    const webpPath = join(dirPath, `${baseName}.webp`)
    const jpgPath = fullPath

    let pipeline = sharp(jpgPath)

    const metadata = await pipeline.metadata()
    if (metadata.width > config.maxWidth) {
      pipeline = pipeline.resize(config.maxWidth, undefined, { withoutEnlargement: true })
    }

    await pipeline.webp({ quality: config.quality, effort: 6 }).toFile(webpPath)

    const originalSize = (await stat(jpgPath)).size
    const newSize = (await stat(webpPath)).size
    const _savings = ((1 - newSize / originalSize) * 100).toFixed(1)

    try {
      await unlink(jpgPath)
    } catch (_err) {}
  }
}

function _formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(2)} MB`
}
await processDirectory(IMAGES_DIR)
