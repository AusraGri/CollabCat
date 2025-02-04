export function setDateToUTCmidnight(date: Date | string) {
  const newDate = new Date(date)
  newDate.setUTCHours(0, 0, 0, 0)

  return newDate
}

export function outputMessageForDelete (param: {objective: string, conditional: boolean}, outcome: boolean = true) {
  const {objective, conditional} = param
  const obj = objective.charAt(0).toUpperCase()
  return {
    success: outcome,
    message: conditional
      ? `${obj} successfully deleted.`
      : `${obj} was not found (possibly already deleted).`
  }
}
