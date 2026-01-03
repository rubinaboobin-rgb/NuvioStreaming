/**
 * TV Styles
 * 
 * Shared style constants for Android TV 10-foot UI experience.
 * These values are optimized for TV viewing distance and remote control.
 */

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Scale factor based on 1080p reference
const SCALE = SCREEN_WIDTH / 1920;

/**
 * TV-optimized style constants
 */
export const TV_STYLES = {
    // Focus indicators
    focus: {
        borderWidth: Math.max(3, Math.round(4 * SCALE)),
        borderColor: '#FFFFFF',
        borderColorSecondary: 'rgba(255, 255, 255, 0.6)',
        scale: 1.05,
        animationDuration: 150,
        shadowColor: '#FFFFFF',
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },

    // Minimum touch targets (Android TV guidelines: 48dp minimum)
    minTouchTarget: Math.max(48, Math.round(48 * SCALE)),

    // Typography - larger for 10-foot UI
    fontSize: {
        hero: Math.round(48 * SCALE),
        title: Math.round(28 * SCALE),
        subtitle: Math.round(22 * SCALE),
        body: Math.round(20 * SCALE),
        caption: Math.round(16 * SCALE),
        button: Math.round(18 * SCALE),
    },

    // Spacing - increased for TV
    spacing: {
        xs: Math.round(4 * SCALE),
        sm: Math.round(8 * SCALE),
        md: Math.round(16 * SCALE),
        lg: Math.round(24 * SCALE),
        xl: Math.round(32 * SCALE),
        xxl: Math.round(48 * SCALE),
    },

    // Content sizing
    poster: {
        width: Math.round(200 * SCALE),
        height: Math.round(300 * SCALE),
        borderRadius: Math.round(12 * SCALE),
    },

    // Navigation rail (left side)
    navRail: {
        width: Math.round(80 * SCALE),
        expandedWidth: Math.round(240 * SCALE),
        iconSize: Math.round(28 * SCALE),
        itemHeight: Math.round(64 * SCALE),
    },

    // Player controls
    player: {
        controlSize: Math.round(64 * SCALE),
        progressHeight: Math.round(8 * SCALE),
        controlSpacing: Math.round(24 * SCALE),
    },

    // Button sizes
    button: {
        height: Math.round(56 * SCALE),
        minWidth: Math.round(120 * SCALE),
        borderRadius: Math.round(28 * SCALE),
        iconSize: Math.round(24 * SCALE),
    },

    // Card dimensions
    card: {
        minHeight: Math.round(80 * SCALE),
        borderRadius: Math.round(8 * SCALE),
        padding: Math.round(16 * SCALE),
    },
} as const;

/**
 * Colors optimized for TV contrast
 */
export const TV_COLORS = {
    focus: '#FFFFFF',
    focusDim: 'rgba(255, 255, 255, 0.6)',
    background: '#0D0D0D',
    surface: '#1A1A1A',
    surfaceElevated: '#262626',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
    accent: '#3B82F6', // Blue accent
    error: '#EF4444',
    success: '#22C55E',
} as const;

/**
 * TV-specific animation configs for smooth focus transitions
 */
export const TV_ANIMATIONS = {
    focusIn: {
        duration: 150,
        useNativeDriver: true,
    },
    focusOut: {
        duration: 100,
        useNativeDriver: true,
    },
    spring: {
        tension: 300,
        friction: 20,
        useNativeDriver: true,
    },
} as const;

export default TV_STYLES;
