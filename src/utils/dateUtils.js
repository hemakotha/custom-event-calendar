export function getMonthDays(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
  
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = firstDayOfMonth.getDay();
  
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
  
    const totalCells = 42; // 6 weeks * 7 days
  
    const days = [];
  
    // Previous month's tail
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }
  
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
  
    // Next month's head
    while (days.length < totalCells) {
      const nextDay = days.length - (startDay + daysInMonth) + 1;
      days.push({
        date: new Date(year, month + 1, nextDay),
        isCurrentMonth: false,
      });
    }
  
    return days;
  }
  