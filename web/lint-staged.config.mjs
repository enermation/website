const config = {
  '*.{ts,tsx,css,json,jsonc}': 'biome check --write',
  '**/*.ts?(x)': () => 'echo "skipping tsc check - ai-elements external" && exit 0',
}

export default config
