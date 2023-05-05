function getNumTypeToday(): { year: number; month: number; date: number } {
  const today: Date = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();

  return { year, month, date };
}

function getStringDate({
  year,
  month,
  date,
}: {
  year: number;
  month: number;
  date: number;
}): string {
  return `${year.toString()}-${month.toString().padStart(2, '0')}-${date
    .toString()
    .padStart(2, '0')}`;
}

export { getNumTypeToday, getStringDate };
