const pad = (value: number): string => value.toString().padStart(2, "0");

/** `YYYY-MM-DD` of a date in the visitor's own time zone, as a date input expects it. */
export const toLocalDateInput = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** `HH:00` of a date in the visitor's own time zone; draws are scheduled on the hour. */
export const toLocalHourInput = (date: Date): string => `${pad(date.getHours())}:00`;

/**
 * The moment a draw is scheduled for, from the date and hour inputs.
 * No hour selected means midnight at the start of that day.
 */
export const combineLocalDateTime = (dateInput: string, hourInput: string): Date =>
  new Date(`${dateInput}T${hourInput || "00:00"}:00`);
