export function useWorkHours() {
  // Helper to convert time string to minutes
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper to convert minutes to time format
  const minutesToTime = (minutes) => {
    const hours = Math.floor(Math.abs(minutes) / 60);
    const mins = Math.abs(minutes) % 60;
    const sign = minutes < 0 ? '-' : '';
    return `${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const calculateWorkedHours = (day) => {
    if (!day.startTime || !day.endTime) return '00:00';
    
    const startMinutes = timeToMinutes(day.startTime);
    const endMinutes = timeToMinutes(day.endTime);
    const breakMinutes = timeToMinutes(day.breakTime || '00:00');
    
    let workedMinutes = endMinutes - startMinutes - breakMinutes;
    if (workedMinutes < 0) workedMinutes = 0; // Can't have negative work time
    
    return minutesToTime(workedMinutes);
  };

  const calculateDifference = (day) => {
    if (!day.requiredHours || !day.startTime || !day.endTime) return '00:00';
    
    const requiredMinutes = timeToMinutes(day.requiredHours);
    const workedMinutes = timeToMinutes(calculateWorkedHours(day));
    
    return minutesToTime(workedMinutes - requiredMinutes);
  };

  const calculateOvertime = (day) => {
    if (!day.startTime || !day.endTime || !day.requiredHours) return '00:00';
    
    const diff = calculateDifference(day);
    return diff.startsWith('-') ? '00:00' : diff;
  };

  return {
    calculateWorkedHours,
    calculateDifference,
    calculateOvertime,
  };
}
