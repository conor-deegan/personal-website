'use client';

import { useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';
const options: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
];

// Runs in <head> before first paint so a saved theme never flashes the wrong colors.
export const themeInitScript = `try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot(): Theme {
    const t = document.documentElement.dataset.theme;
    return t === 'light' || t === 'dark' ? t : 'system';
}

// The server can't know the saved theme, so nothing is marked active until hydration.
function getServerSnapshot(): Theme | null {
    return null;
}

function setTheme(theme: Theme) {
    const root = document.documentElement;
    try {
        if (theme === 'system') {
            delete root.dataset.theme;
            localStorage.removeItem(STORAGE_KEY);
        } else {
            root.dataset.theme = theme;
            localStorage.setItem(STORAGE_KEY, theme);
        }
    } catch {
        // Storage can be unavailable (private mode); the theme still applies for this page view.
    }
    listeners.forEach((l) => l());
}

export default function ThemeSwitcher() {
    const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    return (
        <div role="radiogroup" aria-label="Color theme" className="flex items-center gap-2">
            {options.map(({ value, label }, i) => (
                <span key={value} className="flex items-center gap-2">
                    {i > 0 && (
                        <span className="text-subtle" aria-hidden="true">
                            ·
                        </span>
                    )}
                    <button
                        type="button"
                        role="radio"
                        aria-checked={current === value}
                        onClick={() => setTheme(value)}
                        className={`theme-option${current === value ? ' is-active' : ''}`}
                    >
                        {label}
                    </button>
                </span>
            ))}
        </div>
    );
}
