/**
 * Zero-dependency IndexedDB storage for brand assets (logos, monograms).
 * Bypasses localStorage 5MB quota restrictions and persists permanently
 * across browser sessions, reloads, and tab closures.
 */

export { getPersistentLogo, setPersistentLogo } from './idb-storage';

