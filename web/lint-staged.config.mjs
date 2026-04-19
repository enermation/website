const config = {
  '*.{ts,tsx,css,json,jsonc}': 'biome check --write',
  '**/*.ts?(x)': () =>
    'tsc -p tsconfig.json --incremental --noEmit --skipLibCheck',
}

export default config
