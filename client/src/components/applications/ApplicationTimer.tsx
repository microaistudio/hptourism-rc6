import { useState, useEffect, useRef, useCallback } from 'react';
import { Clock } from 'lucide-react';

interface ApplicationTimerProps {
    applicationId: string;
    isSubmitted?: boolean;
    onTimeUpdate?: (totalSeconds: number) => void;
}

const STORAGE_KEY_PREFIX = 'hptourism_timer_';

/**
 * ApplicationTimer - Tracks time spent filling the application form.
 * 
 * Features:
 * - Persists to localStorage so it survives page refreshes
 * - Pauses when the browser tab is hidden (visibility API)
 * - Stops when application is submitted
 * - Calls onTimeUpdate callback with total seconds for saving to DB
 */
export function ApplicationTimer({
    applicationId,
    isSubmitted = false,
    onTimeUpdate
}: ApplicationTimerProps) {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const storageKey = `${STORAGE_KEY_PREFIX}${applicationId}`;

    // Load saved time from localStorage on mount
    useEffect(() => {
        if (!applicationId) return;

        const savedTime = localStorage.getItem(storageKey);
        if (savedTime) {
            const parsed = parseInt(savedTime, 10);
            if (!isNaN(parsed) && parsed >= 0) {
                setElapsedSeconds(parsed);
            }
        }
    }, [applicationId, storageKey]);

    // Save time to localStorage periodically
    const saveToStorage = useCallback(() => {
        if (applicationId) {
            localStorage.setItem(storageKey, elapsedSeconds.toString());
        }
    }, [applicationId, storageKey, elapsedSeconds]);

    // Handle visibility changes (pause when tab is hidden)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsActive(false);
                saveToStorage();
            } else if (!isSubmitted) {
                setIsActive(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isSubmitted, saveToStorage]);

    // Main timer interval
    useEffect(() => {
        if (isActive && !isSubmitted) {
            intervalRef.current = setInterval(() => {
                setElapsedSeconds(prev => {
                    const newValue = prev + 1;
                    // Save every 10 seconds to reduce localStorage writes
                    if (newValue % 10 === 0) {
                        localStorage.setItem(storageKey, newValue.toString());
                    }
                    return newValue;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, isSubmitted, storageKey]);

    // Notify parent of time on submission or unmount
    useEffect(() => {
        if (isSubmitted && onTimeUpdate) {
            onTimeUpdate(elapsedSeconds);
        }
    }, [isSubmitted, elapsedSeconds, onTimeUpdate]);

    // Save on unmount
    useEffect(() => {
        return () => {
            saveToStorage();
        };
    }, [saveToStorage]);

    // Format time as MM:SS or HH:MM:SS
    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Determine color based on time (green < 15min, yellow < 25min, red > 25min)
    const getTimeColor = (seconds: number): string => {
        if (seconds < 900) return 'text-emerald-600'; // < 15 min - Great!
        if (seconds < 1500) return 'text-amber-600';  // < 25 min - Good
        return 'text-rose-600';                       // > 25 min - Taking long
    };

    if (!applicationId) return null;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-sm">
            <Clock className={`w-4 h-4 ${getTimeColor(elapsedSeconds)}`} />
            <span className="text-slate-500 font-medium">Time Spent:</span>
            <span className={`font-mono font-semibold ${getTimeColor(elapsedSeconds)}`}>
                {formatTime(elapsedSeconds)}
            </span>
            {!isActive && !isSubmitted && (
                <span className="text-xs text-slate-400 ml-1">(paused)</span>
            )}
        </div>
    );
}

/**
 * Helper hook to get elapsed time for an application
 * Useful for reading stored time without rendering the timer
 */
export function useApplicationTimerValue(applicationId: string): number {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!applicationId) return;
        const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${applicationId}`);
        if (stored) {
            const parsed = parseInt(stored, 10);
            if (!isNaN(parsed)) setValue(parsed);
        }
    }, [applicationId]);

    return value;
}

/**
 * Clear timer data after successful submission
 */
export function clearApplicationTimer(applicationId: string): void {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${applicationId}`);
}
