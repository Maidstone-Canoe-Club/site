export function useBetaTester () {
  const user = useDirectusUser();

  const isBetaTester = computed<boolean>(() => {
    return user.value?.beta_tester ?? false;
  });

  return isBetaTester;
}
