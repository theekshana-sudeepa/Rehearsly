/**
 * Ambient declarations.
 *
 * NativeWind compiles global.css through Metro, so the import is a build-time
 * side effect with no runtime exports for TypeScript to find.
 */
declare module '*.css';
