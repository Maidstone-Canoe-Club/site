import {
  addDays,
  addWeeks,
  addMonths,
  addYears
} from "date-fns";

export function getDateFromInstance (date: string, instance: number, recurringType?: string) {
  let result = new Date(date);
  if (instance && recurringType) {
    switch (recurringType) {
    case "0": // daily
      result = addDays(new Date(date), instance - 1);
      break;
    case "1": // weekly
      result = addWeeks(new Date(date), instance - 1);
      break;
    case "2": // monthly
      result = addMonths(new Date(date), instance - 1);
      break;
    case "3": // yearly
      result = addYears(new Date(date), instance - 1);
      break;
    default:
      throw new Error("Invalid recurring pattern type: " + recurringType);
    }
  }

  return result;
}
