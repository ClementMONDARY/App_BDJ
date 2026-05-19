export function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatEventDateRange(start: Date, end: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${formatDate(start)} ${startTime} - ${endTime}`;
  }
  return `${formatDate(start)} ${startTime} - ${formatDate(end)} ${endTime}`;
}
