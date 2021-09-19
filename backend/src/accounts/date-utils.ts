import * as chunkDateRange from 'chunk-date-range';

export interface DateInterval {
  start: Date;
  end: Date;
}

export const substractYearsToDate = (
  numberOfYears: number,
  startDate = new Date(),
): Date => {
  return new Date(
    startDate.setFullYear(startDate.getFullYear() - numberOfYears),
  );
};

export const substractMonthToDate = (
  numberOfMonths: number,
  startDate = new Date(),
): Date => {
  return new Date(startDate.setMonth(startDate.getMonth() - numberOfMonths));
};

// Technically, not yearly, but in chunks of 365 days
export const getYearlyIntervalFromDate = (
  startDate: Date,
  endDate = new Date(),
): DateInterval[] => {
  const millisecondsIn365days = 365 * 24 * 60 * 60 * 1000;
  const differenceInMilliseconds = endDate.getTime() - startDate.getTime();
  const numberOfChunks = differenceInMilliseconds / millisecondsIn365days;

  const dateIntervals = chunkDateRange(startDate, endDate, numberOfChunks);
  return dateIntervals;
};
