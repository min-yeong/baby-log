export function calculatePregnancyWeek(dueDate: string): {
  weeks: number;
  days: number;
  totalDays: number;
} {
  const due = new Date(dueDate);
  const now = new Date();

  // 출산예정일에서 280일(40주)을 빼면 마지막 생리일
  const lmpDate = new Date(due);
  lmpDate.setDate(lmpDate.getDate() - 280);

  // 마지막 생리일부터 오늘까지의 일수
  const diffTime = now.getTime() - lmpDate.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;

  return { weeks: Math.max(0, weeks), days: Math.max(0, days), totalDays };
}

export function formatPregnancyWeek(dueDate: string): string {
  const { weeks, days } = calculatePregnancyWeek(dueDate);
  return `${weeks}주 ${days}일`;
}

export function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getTrimester(weeks: number): 1 | 2 | 3 {
  if (weeks < 14) return 1;
  if (weeks < 28) return 2;
  return 3;
}
