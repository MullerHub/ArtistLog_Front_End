type TagSource = string[] | string | undefined

const splitCsv = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

const toArray = (source: TagSource): string[] => {
  if (!source) return []
  if (Array.isArray(source)) {
    return source.map((item) => item.trim()).filter(Boolean)
  }
  return splitCsv(source)
}

const dedupe = (values: string[]): string[] => {
  const seen = new Set<string>()
  const result: string[] = []

  values.forEach((value) => {
    const key = value.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(value)
    }
  })

  return result
}

export function mergeArtistTagFields(input: {
  tags?: TagSource
  genres?: TagSource
  event_types?: TagSource
}): string[] {
  return dedupe([
    ...toArray(input.tags),
    ...toArray(input.genres),
    ...toArray(input.event_types),
  ])
}