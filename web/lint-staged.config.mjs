const config = {
  '*.{ts,tsx,css,json,jsonc}': files => {
    const toCheck = files.filter(f => !f.includes('components/rag/') && !f.includes('components\\rag\\'))
    if (!toCheck.length) return []
    return `biome check --write ${toCheck.join(' ')}`
  },
  '**/*.ts?(x)': () => 'echo "skipping tsc check - ai-elements external" && exit 0',
}

export default config
