export function sortWithPinsFirst<T>(
  items: T[],
  isPinned: (item: T) => boolean,
  compare: (a: T, b: T) => number,
): T[] {
  return [...items].sort((a, b) => {
    const pinDelta = Number(isPinned(b)) - Number(isPinned(a));
    if (pinDelta !== 0) return pinDelta;
    return compare(a, b);
  });
}
