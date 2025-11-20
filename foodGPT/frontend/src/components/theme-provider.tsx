/**
 * Theme Provider
 * Wraps the app with next-themes for dark mode support
/**
 * Theme Provider
 * Wraps the app with next-themes for dark mode support
 */

'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
