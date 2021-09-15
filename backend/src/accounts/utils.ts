export const getDateYearsBefore = (
  numberOfYears: number,
  startDate = new Date(),
): Date => {
  return new Date(
    startDate.setFullYear(startDate.getFullYear() - numberOfYears),
  );
};

export const getDateMonthBefore = (
  numberOfMonths: number,
  startDate = new Date(),
): Date => {
  return new Date(startDate.setMonth(startDate.getMonth() - numberOfMonths));
};
