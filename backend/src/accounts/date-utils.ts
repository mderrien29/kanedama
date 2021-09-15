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

// could have issue with gap years
export const getYearlyIntervalFromDate = (
  startDate: Date,
  endDate = new Date(),
): DateInterval[] => {
  const numberOfChunks = endDate.getFullYear() - startDate.getFullYear();
  const dateIntervals = chunkDateRange(startDate, endDate, numberOfChunks);
  return dateIntervals;
};
