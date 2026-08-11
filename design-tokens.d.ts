/** Type surface for design-tokens.js so TypeScript consumers get real types. */

export interface DesignColors {
  cream: string;
  surface: string;
  border: string;
  ink: { DEFAULT: string; muted: string; faint: string };
  clay: { 50: string; 100: string; 300: string; 500: string; 600: string; 700: string };
  sage: { 100: string; 500: string; 700: string };
  amber: { 100: string; 500: string; 700: string };
  rose: { 100: string; 500: string; 700: string };
}

export declare const colors: DesignColors;
export declare const fontSize: Record<string, readonly [string, string]>;
export declare const borderRadius: Record<string, string>;
export declare const spacing: Record<string, string>;
