﻿import { format } from "date-fns";

export function capitalize (input: string) {
  return input[0].toUpperCase() + input.slice(1);
}

export function clickOrTap (shouldCapitalize?: boolean) {
  const { isMobileOrTablet } = useDevice();
  const result = isMobileOrTablet ? "tap" : "click";
  return shouldCapitalize ? capitalize(result) : result;
}

export function formatShortTime (input: Date | string) {
  const date = new Date(input);
  const minutes = format(date, "mm");
  if (minutes === "00") {
    return format(date, "haa").toLowerCase();
  } else {
    return format(date, "h:mmaa").toLowerCase();
  }
}
