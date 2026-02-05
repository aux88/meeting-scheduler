export const getLocalTimezoneOffset = (): string => {
    const date = new Date();
    const offsetMinutes = date.getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
    const offsetRemainingMinutes = Math.abs(offsetMinutes % 60);

    const sign = offsetMinutes > 0 ? "-" : "+"; // getTimezoneOffset is positive for UTC-X, negative for UTC+X

    const paddedHours = String(offsetHours).padStart(2, "0");
    const paddedMinutes = String(offsetRemainingMinutes).padStart(2, "0");

    return `${sign}${paddedHours}:${paddedMinutes}`;
};

// Converts "HH:MM:SS+TZ" or "HH:MM" to minutes from midnight (local time without timezone conversion)
export const timeToMinutes = (time: string): number => {
    // This assumes the time string is already in the local reference for calculation purposes
    const cleaned = time.split(/[+-]/)[0]; // Remove timezone offset for simple HH:MM parsing
    const [hoursStr, minutesStr] = cleaned.split(":");
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);

    return hours * 60 + minutes;
};

// Converts minutes from midnight to "HH:MM" string
export const minutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Finds the overlap between two time intervals (in minutes)
export const getOverlap = (
    interval1: { start: number; end: number },
    interval2: { start: number; end: number }
): { start: number; end: number } | null => {
    const start = Math.max(interval1.start, interval2.start);
    const end = Math.min(interval1.end, interval2.end);
    if (start < end) {
        return { start, end };
    }
    return null;
};

// Merges overlapping or contiguous time intervals
export const mergeIntervals = (
    intervals: { start: number; end: number }[]
): { start: number; end: number }[] => {
    if (intervals.length === 0) {
        return [];
    }

    // Sort intervals by start time
    intervals.sort((a, b) => a.start - b.start);

    const merged: { start: number; end: number }[] = [];
    let currentMerged = { ...intervals[0] };

    for (let i = 1; i < intervals.length; i++) {
        const next = intervals[i];
        // If currentMerged and next interval overlap or are contiguous
        if (next.start <= currentMerged.end) {
            currentMerged.end = Math.max(currentMerged.end, next.end);
        } else {
            merged.push(currentMerged);
            currentMerged = { ...next };
        }
    }
    merged.push(currentMerged);
    return merged;
};

// Formats a date string (YYYY-MM-DD) to "YYYY年MM月DD日"
export const formatDateToJapanese = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Formats a time string (HH:MM or HH:MM:SS+TZ) with a date string to "HH:MM" in JST (UTC+9)
export const formatTimeToJapanese = (dateString: string, timeString: string): string => {
    // Combine date and time to create a full ISO string for accurate Date object parsing
    // Handle cases where timeString might not have seconds or timezone, assume it's part of the dateString's local day
    let dateTimeString;
    if (timeString.includes(':') && timeString.length <= 5) { // HH:MM format
        dateTimeString = `${dateString}T${timeString}:00+09:00`; // Assume JST if no timezone is provided
    } else { // HH:MM:SS+TZ format, or other more complete formats
        dateTimeString = `${dateString}T${timeString}`;
    }
    
    const date = new Date(dateTimeString.replace(/([+-]\d{2})$/, "$1:00"));

    // Use Intl.DateTimeFormat to ensure JST (UTC+9) and HH:MM format
    return new Intl.DateTimeFormat('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Tokyo', // JST (UTC+9)
        hourCycle: 'h23' // Ensures 24-hour format
    }).format(date);
};