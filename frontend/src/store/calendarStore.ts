import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useCalendarStore = defineStore("calendar", () => {
  const year = ref(new Date().getFullYear());
  const month = ref(new Date().getMonth());
  const day = ref(new Date().getDate());

  const getYear = computed(() => year.value);
  const getMonth = computed(() => month.value);
  const getDay = computed(() => day.value);

  function getDaysInMonth (year: number, month: number) {
    const date = new Date(year, month + 1, 0);
    return date.getDate();
  }

  function incrementYear (val: number) {
    year.value = year.value + val;
  }
  function decrementYear (val: number) {
    year.value = year.value - val;
  }
  function incrementMonth (val: number) {
    if (month.value === 11) {
      incrementYear(1);
      month.value = 0;
      return;
    }

    month.value = month.value + val;

    const daysInMonth = getDaysInMonth(year.value, month.value);
    if (day.value > daysInMonth) {
      day.value = daysInMonth;
    }
  }
  function decrementMonth (val: number) {
    if (month.value === 0) {
      decrementYear(1);
      month.value = 11;
      return;
    }

    month.value = month.value - val;
  }
  function incrementDay (val: number) {
    day.value = day.value + val;
  }

  function setMonth (val: number) {
    month.value = val;
  }

  function setYear (val: number) {
    year.value = val;
  }

  function resetDate () {
    year.value = new Date().getFullYear();
    month.value = new Date().getMonth();
    day.value = new Date().getDate();
  }

  return {
    year,
    month,
    day,
    getYear,
    getMonth,
    getDay,
    incrementYear,
    incrementMonth,
    decrementMonth,
    setMonth,
    setYear,
    resetDate
  };
});
