const config = {
  '*.{ts,tsx,css,json,jsonc}': 'biome check --write',
  '**/*.ts?(x)': () => 'tsc -p tsconfig.json --incremental --noEmit',
}

export default config
