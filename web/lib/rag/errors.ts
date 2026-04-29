export class RateLimitError extends Error {
  readonly statusCode = 429
  constructor(message = 'Rate limit exceeded') {
    super(message)
    this.name = 'RateLimitError'
  }
}

export class ServerError extends Error {
  readonly statusCode: number
  constructor(message: string, statusCode = 500) {
    super(message)
    this.name = 'ServerError'
    this.statusCode = statusCode
  }
}

export class UpsertError extends Error {
  readonly ids: string[]
  constructor(message: string, ids: string[]) {
    super(message)
    this.name = 'UpsertError'
    this.ids = ids
  }
}
