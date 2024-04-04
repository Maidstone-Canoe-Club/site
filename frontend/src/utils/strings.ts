export function capitalize (input: string) {
  return input[0].toUpperCase() + input.slice(1);
}

export function clickOrTap (shouldCapitalize?: boolean) {
  const { isMobileOrTablet } = useDevice();
  const result = isMobileOrTablet ? "tap" : "click";
  return shouldCapitalize ? capitalize(result) : result;
}
