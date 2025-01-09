export function setDateToUTCmidnight(date: Date | string) {
    const newDate = new Date(date)
    newDate.setUTCHours(0, 0, 0, 0)

    return newDate
  }