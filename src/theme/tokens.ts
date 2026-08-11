/**
 * Typed access to the design tokens for APIs that do not accept `className`
 * (React Navigation themes, StatusBar, native props).
 *
 * For anything renderable, prefer Tailwind classes over these values so the
 * styling stays in one idiom.
 */
import { colors } from '../../design-tokens';

export { colors };

/** React Navigation theme derived from the same tokens as the Tailwind utilities. */
export const navigationColors = {
  primary: colors.clay[500],
  background: colors.cream,
  card: colors.surface,
  text: colors.ink.DEFAULT,
  border: colors.border,
  notification: colors.clay[500],
} as const;
