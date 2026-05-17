import type { Mock } from 'bun:test'

/**
 * Cast a function to its Bun Mock type equivalent.
 * This replaces vi.mocked() from Vitest.
 */
export function mocked<T extends (...args: unknown[]) => unknown>(fn: T): Mock<T> {
  return fn as unknown as Mock<T>
}
