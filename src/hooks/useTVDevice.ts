/**
 * useTVDevice Hook
 * 
 * Provides TV device detection and D-pad remote control handling for Android TV.
 * Uses React Native's Platform.isTV with fallback to screen dimensions.
 */

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { Platform, Dimensions, TVEventHandler, HWEvent } from 'react-native';
import { useSettings } from './useSettings';

// D-pad key codes for Android TV remotes
export const TV_REMOTE_KEYS = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
    SELECT: 'select',
    PLAY_PAUSE: 'playPause',
    REWIND: 'rewind',
    FAST_FORWARD: 'fastForward',
    BACK: 'back',
    MENU: 'menu',
} as const;

export type TVRemoteKey = typeof TV_REMOTE_KEYS[keyof typeof TV_REMOTE_KEYS];

export interface TVRemoteEvent {
    eventType: TVRemoteKey;
    eventKeyAction: 'up' | 'down' | 'long-press';
    tag?: number;
}

interface UseTVDeviceResult {
    /** Whether the current device is an Android TV */
    isTVDevice: boolean;
    /** Register a handler for TV remote key events */
    useRemoteHandler: (handler: (event: TVRemoteEvent) => void) => void;
    /** TV-optimized dimensions */
    tvDimensions: {
        posterWidth: number;
        posterHeight: number;
        iconSize: number;
        fontSize: {
            title: number;
            body: number;
            caption: number;
        };
        spacing: {
            small: number;
            medium: number;
            large: number;
        };
        focusBorderWidth: number;
    };
}

// Screen dimension thresholds for TV detection fallback
const TV_MIN_WIDTH = 1280;
const TV_MIN_HEIGHT = 720;

/**
 * Detect if running on an Android TV device
 */
const detectTVDevice = (forceTVMode: boolean): boolean => {
    // Allow forcing TV mode for development/testing
    if (forceTVMode) {
        return true;
    }

    // Primary check: React Native's built-in TV detection
    if (Platform.isTV) {
        return true;
    }

    // Android TV secondary check via dimensions (for devices not detected by Platform.isTV)
    if (Platform.OS === 'android') {
        const { width, height } = Dimensions.get('window');
        const isLandscape = width > height;
        const isLargeScreen = width >= TV_MIN_WIDTH && height >= TV_MIN_HEIGHT;

        // TV devices are typically always landscape with large screens
        // and have a specific aspect ratio range (16:9 to 21:9)
        if (isLandscape && isLargeScreen) {
            const aspectRatio = width / height;
            const isTVAspectRatio = aspectRatio >= 1.7 && aspectRatio <= 2.4;
            return isTVAspectRatio;
        }
    }

    return false;
};

/**
 * Calculate TV-optimized dimensions based on screen size
 */
const calculateTVDimensions = () => {
    const { width, height } = Dimensions.get('window');

    // Base calculations for 1080p TV (1920x1080)
    const baseWidth = 1920;
    const scale = width / baseWidth;

    return {
        posterWidth: Math.round(200 * scale),
        posterHeight: Math.round(300 * scale),
        iconSize: Math.round(32 * scale),
        fontSize: {
            title: Math.round(28 * scale),
            body: Math.round(20 * scale),
            caption: Math.round(16 * scale),
        },
        spacing: {
            small: Math.round(8 * scale),
            medium: Math.round(16 * scale),
            large: Math.round(32 * scale),
        },
        focusBorderWidth: Math.round(4 * scale),
    };
};

/**
 * Hook for TV device detection and remote control handling
 */
export const useTVDevice = (): UseTVDeviceResult => {
    const { settings } = useSettings();
    const tvEventHandlerRef = useRef<TVEventHandler | null>(null);

    // Detect TV device with memoization
    const isTVDevice = useMemo(() => {
        return detectTVDevice(settings.forceTVMode ?? false);
    }, [settings.forceTVMode]);

    // Calculate TV dimensions with memoization
    const tvDimensions = useMemo(() => {
        return calculateTVDimensions();
    }, []);

    /**
     * Hook for registering TV remote event handler
     * Automatically cleans up on unmount
     */
    const useRemoteHandler = useCallback((handler: (event: TVRemoteEvent) => void) => {
        useEffect(() => {
            if (!isTVDevice) {
                return;
            }

            // Create TV event handler
            const tvEventHandler = new TVEventHandler();
            tvEventHandlerRef.current = tvEventHandler;

            // Enable and subscribe to TV events
            tvEventHandler.enable(undefined, (component: any, hwEvent: HWEvent) => {
                if (!hwEvent) return;

                // Map hardware event to our TVRemoteEvent type
                const event: TVRemoteEvent = {
                    eventType: hwEvent.eventType as TVRemoteKey,
                    eventKeyAction: hwEvent.eventKeyAction === 0 ? 'down' :
                        hwEvent.eventKeyAction === 1 ? 'up' : 'long-press',
                    tag: hwEvent.tag,
                };

                // Only trigger on key down to prevent double-firing
                if (event.eventKeyAction === 'down' || event.eventKeyAction === 'long-press') {
                    handler(event);
                }
            });

            // Cleanup on unmount
            return () => {
                if (tvEventHandlerRef.current) {
                    tvEventHandlerRef.current.disable();
                    tvEventHandlerRef.current = null;
                }
            };
        }, [handler, isTVDevice]);
    }, [isTVDevice]);

    return {
        isTVDevice,
        useRemoteHandler,
        tvDimensions,
    };
};

/**
 * Simple check for TV device without hook overhead
 * Use when you just need a boolean check
 */
export const isAndroidTV = (): boolean => {
    if (Platform.isTV) {
        return true;
    }

    if (Platform.OS === 'android') {
        const { width, height } = Dimensions.get('window');
        if (width >= TV_MIN_WIDTH && height >= TV_MIN_HEIGHT && width > height) {
            const aspectRatio = width / height;
            return aspectRatio >= 1.7 && aspectRatio <= 2.4;
        }
    }

    return false;
};

export default useTVDevice;
