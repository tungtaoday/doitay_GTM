/**
 * Custom React hooks for the ThợTốt app
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for managing localStorage with state sync
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
    // Get initial value from localStorage or use default
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Update localStorage when state changes
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    // Remove from localStorage
    const removeValue = useCallback(() => {
        try {
            localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue] as const;
}

/**
 * Hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Hook for tracking previous value
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

/**
 * Hook for toggle state
 */
export function useToggle(initialValue = false): [boolean, () => void, (value: boolean) => void] {
    const [value, setValue] = useState(initialValue);
    const toggle = useCallback(() => setValue(v => !v), []);
    return [value, toggle, setValue];
}

/**
 * Hook for form field validation
 */
export function useFormField<T>(initialValue: T, validator?: (value: T) => string | null) {
    const [value, setValue] = useState<T>(initialValue);
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);

    const validate = useCallback(() => {
        if (validator) {
            const validationError = validator(value);
            setError(validationError);
            return validationError === null;
        }
        return true;
    }, [value, validator]);

    const onChange = useCallback((newValue: T) => {
        setValue(newValue);
        setTouched(true);
        if (error) {
            // Re-validate on change if already has error
            if (validator) {
                setError(validator(newValue));
            }
        }
    }, [error, validator]);

    const onBlur = useCallback(() => {
        setTouched(true);
        validate();
    }, [validate]);

    const reset = useCallback(() => {
        setValue(initialValue);
        setError(null);
        setTouched(false);
    }, [initialValue]);

    return {
        value,
        error,
        touched,
        onChange,
        onBlur,
        validate,
        reset,
        isValid: error === null,
    };
}

/**
 * Hook for multi-step form
 */
export function useMultiStepForm(totalSteps: number, initialStep = 1) {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    const goToStep = useCallback((step: number) => {
        if (step >= 1 && step <= totalSteps) {
            setCurrentStep(step);
        }
    }, [totalSteps]);

    const nextStep = useCallback(() => {
        setCompletedSteps(prev => new Set(prev).add(currentStep));
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, totalSteps]);

    const prevStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const reset = useCallback(() => {
        setCurrentStep(initialStep);
        setCompletedSteps(new Set());
    }, [initialStep]);

    return {
        currentStep,
        totalSteps,
        isFirstStep: currentStep === 1,
        isLastStep: currentStep === totalSteps,
        completedSteps,
        progress: (currentStep / totalSteps) * 100,
        goToStep,
        nextStep,
        prevStep,
        reset,
    };
}

/**
 * Hook for clipboard copy
 */
export function useClipboard(timeout = 2000) {
    const [copied, setCopied] = useState(false);

    const copy = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), timeout);
            return true;
        } catch (error) {
            console.error('Failed to copy:', error);
            return false;
        }
    }, [timeout]);

    return { copied, copy };
}

/**
 * Hook for media query
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [query]);

    return matches;
}

/**
 * Hook for detecting mobile device
 */
export function useIsMobile(): boolean {
    return useMediaQuery('(max-width: 768px)');
}
