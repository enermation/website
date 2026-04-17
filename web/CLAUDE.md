@AGENTS.md

---

## Pretext — Text Measurement

This project uses **`@chenglou/pretext`** for DOM-reflow-free multiline text measurement.

### When to use
- **Dynamic height containers** where you need text dimensions before rendering (virtualized lists, chat messages, "show more" buttons)
- **AI chat interfaces** — streaming messages with unknown heights
- **Text truncation** where pixel-accurate height matters

### When NOT to use
- CSS `line-clamp-N` handles most truncation needs — use that instead
- Single-line `truncate` — CSS handles this

### Files
- `lib/text.ts` — server-side utilities: `prepareBody()`, `prepareHeading()`, `measureText()`, `truncateForMeta()`, `truncateToLines()`
- `hooks/use-text-measurement.ts` — client-side hook with caching: `useTextMeasurement()`

### Pattern
```ts
// Server (one-time cost, reuse often)
import { prepareBody, measureText, LINE_HEIGHT_BODY } from '@/lib/text'
const prepared = prepareBody(text)
const { height, lineCount } = measureText(prepared, maxWidth, LINE_HEIGHT_BODY)

// Client hook (caches PreparedText internally)
const { measure } = useTextMeasurement()
const { height, lineCount } = measure(text, 'body', containerWidth)
```
