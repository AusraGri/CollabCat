export function setDateToUTCmidnight(date: Date | string) {
  const newDate = new Date(date)
  newDate.setUTCHours(0, 0, 0, 0)

  return newDate
}


export function removeNullValues<T extends { [key: string]: any }>(obj: T): Partial<T> {
  return Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(obj).filter(([_, value]) => value !== null)
  ) as Partial<T>;
}