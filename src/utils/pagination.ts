export function paginate({startIndex, count, totalCount}) {
  return {
    page: Math.ceil(startIndex / count) + 1,
    pages: Math.ceil(totalCount / count),
  }
}
