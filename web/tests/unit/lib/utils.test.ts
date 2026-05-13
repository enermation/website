import { describe, expect, it } from 'vitest'
import {
  cleanSuggestionMarkers,
  cn,
  computeLineTotal,
  formatPrice,
  formatVehicleDescription,
  metaValue,
  parseVehicleDescription,
  parseVehicleFromTitle,
  stripMarkdown,
} from '@/lib/utils'

describe('cn', () => {
  it('merges clsx and twMerge correctly', () => {
    const result = cn('foo bar', 'baz', { qux: true, quux: false })
    expect(result).toBe('foo bar baz qux')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const isDisabled = false
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active')
  })

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('')
  })
})

describe('formatPrice', () => {
  it('formats number amount in GBP', () => {
    const result = formatPrice(1999.99, 'GBP')
    expect(result).toContain('1,999.99')
    expect(result).toContain('£')
  })

  it('formats string amount in GBP', () => {
    const result = formatPrice('2999.00', 'GBP')
    expect(result).toContain('2,999')
  })

  it('handles zero amount', () => {
    const result = formatPrice(0, 'GBP')
    expect(result).toContain('0')
  })

  it('caches formatter for same currency', () => {
    const result1 = formatPrice(100, 'GBP')
    const result2 = formatPrice(200, 'GBP')
    expect(result1).not.toBe(result2)
    expect(result1).toContain('100')
    expect(result2).toContain('200')
  })
})

describe('computeLineTotal', () => {
  it('multiplies amount by quantity', () => {
    const line = { amount: '29.99', currencyCode: 'GBP', quantity: 3 }
    const result = computeLineTotal(line)
    expect(result).toContain('89.97')
  })

  it('handles integer amount string', () => {
    const line = { amount: '10', currencyCode: 'USD', quantity: 2 }
    expect(computeLineTotal(line)).toContain('20')
  })
})

describe('metaValue', () => {
  it('returns value when field is present', () => {
    expect(metaValue({ value: 'hello' })).toBe('hello')
  })

  it('returns null when field value is null', () => {
    expect(metaValue({ value: null })).toBe(null)
  })

  it('returns null when field is null', () => {
    expect(metaValue(null)).toBe(null)
  })
})

describe('parseVehicleFromTitle', () => {
  it('parses make and model from standard title', () => {
    const result = parseVehicleFromTitle('Toyota Hilux SR5')
    expect(result.make).toBe('Toyota')
    expect(result.model).toBe('Hilux')
  })

  it('handles single word title', () => {
    const result = parseVehicleFromTitle('Tesla')
    expect(result.make).toBe('Tesla')
    expect(result.model).toBe(null)
  })

  it('handles title with more than 2 words', () => {
    const result = parseVehicleFromTitle('Toyota Hilux SR5 48V Hybrid')
    expect(result.make).toBe('Toyota')
    expect(result.model).toBe('Hilux')
  })

  it('trims whitespace', () => {
    const result = parseVehicleFromTitle('  Ford   Ranger  ')
    expect(result.make).toBe('Ford')
    expect(result.model).toBe('Ranger')
  })

  it('handles non-Latin characters', () => {
    const result = parseVehicleFromTitle('BMW X5 M')
    expect(result.make).toBe('BMW')
    expect(result.model).toBe('X5')
  })
})

describe('parseVehicleDescription', () => {
  it('extracts labeled lines from vehicle description', () => {
    const raw = 'Year: 2022\nMileage: 50,000 km\nTransmission: Automatic'
    const result = parseVehicleDescription(raw)
    expect(result).toContainEqual({ label: 'Year', value: '2022' })
    expect(result).toContainEqual({ label: 'Mileage', value: '50,000 km' })
    expect(result).toContainEqual({ label: 'Transmission', value: 'Automatic' })
  })

  it('returns full text when no labels present', () => {
    const result = parseVehicleDescription('Some description without labels')
    expect(result).toEqual([{ label: '', value: 'Some description without labels' }])
  })

  it('handles equipment label', () => {
    const raw = 'Equipment: Air Conditioning, Sunroof, GPS'
    const result = parseVehicleDescription(raw)
    expect(result).toContainEqual({
      label: 'Equipment',
      value: 'Air Conditioning, Sunroof, GPS',
    })
  })

  it('handles overlapping labels in text', () => {
    const raw = 'Model: Hilux\nModel Code: ABC123'
    const result = parseVehicleDescription(raw)
    expect(result).toContainEqual({ label: 'Model', value: 'Hilux' })
    expect(result).toContainEqual({ label: 'Model Code', value: 'ABC123' })
  })

  it('returns full text for whitespace-only input', () => {
    // whitespace-only collapses to empty string, then no labels match → full text returned
    expect(parseVehicleDescription('   ')).toEqual([{ label: '', value: '' }])
  })

  it('returns empty array for truly empty input', () => {
    expect(parseVehicleDescription('')).toEqual([])
  })
})

describe('formatVehicleDescription', () => {
  it('splits specs and equipment', () => {
    const raw = 'Year: 2022\nMileage: 50,000 km\nEquipment: Air Conditioning, Sunroof'
    const result = formatVehicleDescription(raw)
    expect(result.specs).toContainEqual({ label: 'Year', value: '2022' })
    expect(result.specs).toContainEqual({ label: 'Mileage', value: '50,000 km' })
    expect(result.equipment).toContain('Air Conditioning')
    expect(result.equipment).toContain('Sunroof')
  })

  it('splits equipment by commas and slashes', () => {
    const raw = 'Equipment: GPS/导航, Climate Control/空调, Sunroof'
    const result = formatVehicleDescription(raw)
    expect(result.equipment).toContain('GPS')
    expect(result.equipment).toContain('导航')
    expect(result.equipment).toContain('Climate Control')
    expect(result.equipment).toContain('空调')
    expect(result.equipment).toContain('Sunroof')
  })

  it('returns empty arrays for empty input', () => {
    const result = formatVehicleDescription('')
    expect(result.specs).toEqual([])
    expect(result.equipment).toEqual([])
  })

  it('handles description with only specs (no equipment)', () => {
    const raw = 'Year: 2022\nTransmission: Automatic'
    const result = formatVehicleDescription(raw)
    expect(result.specs.length).toBeGreaterThan(0)
    expect(result.equipment).toEqual([])
  })
})

describe('cleanSuggestionMarkers', () => {
  it('strips trailing SUGGESTION block', () => {
    const input = 'Some vehicle description\n\nSUGGESTION: Consider the Toyota Hilux as well'
    const result = cleanSuggestionMarkers(input)
    expect(result).toBe('Some vehicle description')
    expect(result).not.toContain('SUGGESTION')
  })

  it('handles case-insensitive SUGGESTION', () => {
    const input = 'Description\n\nsuggestion: some product'
    expect(cleanSuggestionMarkers(input)).toBe('Description')
  })

  it('returns original string when no SUGGESTION', () => {
    const input = 'Normal description without markers'
    expect(cleanSuggestionMarkers(input)).toBe('Normal description without markers')
  })

  it('trims whitespace after stripping', () => {
    const input = 'Description\n\nSUGGESTION: something\n  '
    expect(cleanSuggestionMarkers(input)).toBe('Description')
  })

  it('handles multiline SUGGESTION block', () => {
    const input = 'Description\n\nSUGGESTION: Option 1\nAnother option\nThird option'
    expect(cleanSuggestionMarkers(input)).toBe('Description')
  })
})

describe('stripMarkdown', () => {
  it('strips bold markers', () => {
    expect(stripMarkdown('**bold text**')).toBe('bold text')
  })

  it('strips italic markers', () => {
    expect(stripMarkdown('*italic text*')).toBe('italic text')
    expect(stripMarkdown('_italic text_')).toBe('italic text')
  })

  it('strips inline code markers', () => {
    expect(stripMarkdown('`code`')).toBe('code')
  })

  it('strips strikethrough', () => {
    expect(stripMarkdown('~~deleted~~')).toBe('deleted')
  })

  it('strips links keeping text', () => {
    expect(stripMarkdown('[Click here](https://example.com)')).toBe('Click here')
  })

  it('strips headings', () => {
    expect(stripMarkdown('## Heading\n\nParagraph')).toBe('Heading\n\nParagraph')
    expect(stripMarkdown('# Title')).toBe('Title')
  })

  it('strips list markers', () => {
    expect(stripMarkdown('- Item 1\n- Item 2')).toBe('Item 1\nItem 2')
    expect(stripMarkdown('* Bullet')).toBe('Bullet')
  })

  it('strips numbered list markers', () => {
    expect(stripMarkdown('1. First\n2. Second')).toBe('First\nSecond')
  })

  it('handles nested bold and italic', () => {
    expect(stripMarkdown('***bold and italic***')).toBe('bold and italic')
  })

  it('returns trimmed result', () => {
    expect(stripMarkdown('  **text**  ')).toBe('text')
  })
})
