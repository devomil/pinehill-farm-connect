
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Define Attribute type locally instead of importing from next-themes/dist/types
type Attribute = string | string[]

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  enableSystem?: boolean;
  enableColorScheme?: boolean;
  forcedTheme?: string;
  disableTransitionOnChange?: boolean;
  attribute?: Attribute | Attribute[];  // Updated to match the expected type
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
