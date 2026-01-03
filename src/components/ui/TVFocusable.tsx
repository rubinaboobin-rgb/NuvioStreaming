/**
 * TVFocusable Component
 * 
 * A wrapper component that provides consistent focus styling for Android TV.
 * Handles focus/blur animations, scale effects, and border highlights.
 */

import React, { useCallback, useRef, useState, memo } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    Animated,
    Platform,
    GestureResponderEvent,
    TouchableOpacityProps,
} from 'react-native';
import { TV_STYLES, TV_COLORS, TV_ANIMATIONS } from '../../styles/tvStyles';
import { isAndroidTV } from '../../hooks/useTVDevice';

export interface TVFocusableProps extends Omit<TouchableOpacityProps, 'onFocus' | 'onBlur'> {
    /** Content to render inside the focusable wrapper */
    children: React.ReactNode;
    /** Custom styles for the container */
    style?: ViewStyle;
    /** Whether this element should receive initial focus */
    hasTVPreferredFocus?: boolean;
    /** Callback when element receives focus */
    onFocus?: () => void;
    /** Callback when element loses focus */
    onBlur?: () => void;
    /** Callback when element is pressed/selected */
    onPress?: (event?: GestureResponderEvent) => void;
    /** Disable focus functionality */
    disabled?: boolean;
    /** Custom focus border color */
    focusColor?: string;
    /** Show scale animation on focus */
    scaleOnFocus?: boolean;
    /** Custom scale factor for focus animation */
    focusScale?: number;
    /** Show border on focus */
    showFocusBorder?: boolean;
    /** Border radius for focus indicator */
    borderRadius?: number;
    /** Test ID for testing */
    testID?: string;
}

/**
 * TVFocusable - Wrapper component for TV-navigable elements
 * 
 * Provides consistent focus styling with animated scale and border effects.
 * Falls back to standard TouchableOpacity behavior on non-TV devices.
 */
const TVFocusable: React.FC<TVFocusableProps> = memo(({
    children,
    style,
    hasTVPreferredFocus = false,
    onFocus,
    onBlur,
    onPress,
    disabled = false,
    focusColor = TV_COLORS.focus,
    scaleOnFocus = true,
    focusScale = TV_STYLES.focus.scale,
    showFocusBorder = true,
    borderRadius = TV_STYLES.card.borderRadius,
    testID,
    ...touchableProps
}) => {
    const isTVDevice = isAndroidTV();
    const [isFocused, setIsFocused] = useState(false);

    // Animation values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const borderOpacityAnim = useRef(new Animated.Value(0)).current;

    // Handle focus event
    const handleFocus = useCallback(() => {
        setIsFocused(true);

        // Animate scale up
        if (scaleOnFocus) {
            Animated.spring(scaleAnim, {
                toValue: focusScale,
                ...TV_ANIMATIONS.spring,
            }).start();
        }

        // Animate border in
        if (showFocusBorder) {
            Animated.timing(borderOpacityAnim, {
                toValue: 1,
                ...TV_ANIMATIONS.focusIn,
            }).start();
        }

        onFocus?.();
    }, [scaleAnim, borderOpacityAnim, focusScale, scaleOnFocus, showFocusBorder, onFocus]);

    // Handle blur event
    const handleBlur = useCallback(() => {
        setIsFocused(false);

        // Animate scale back
        if (scaleOnFocus) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                ...TV_ANIMATIONS.spring,
            }).start();
        }

        // Animate border out
        if (showFocusBorder) {
            Animated.timing(borderOpacityAnim, {
                toValue: 0,
                ...TV_ANIMATIONS.focusOut,
            }).start();
        }

        onBlur?.();
    }, [scaleAnim, borderOpacityAnim, scaleOnFocus, showFocusBorder, onBlur]);

    // Handle press with optional keyboard/select button
    const handlePress = useCallback((event?: GestureResponderEvent) => {
        if (!disabled) {
            onPress?.(event);
        }
    }, [disabled, onPress]);

    // Non-TV devices: render simple TouchableOpacity
    if (!isTVDevice) {
        return (
            <TouchableOpacity
                style={style}
                onPress={handlePress}
                disabled={disabled}
                activeOpacity={0.7}
                testID={testID}
                {...touchableProps}
            >
                {children}
            </TouchableOpacity>
        );
    }

    // TV devices: render with focus animations
    const animatedStyle: Animated.AnimatedProps<ViewStyle> = {
        transform: [{ scale: scaleAnim }],
    };

    const focusBorderStyle = {
        borderColor: focusColor,
        borderWidth: TV_STYLES.focus.borderWidth,
        borderRadius,
        opacity: borderOpacityAnim,
    };

    return (
        <TouchableOpacity
            style={[styles.wrapper, style]}
            onPress={handlePress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            activeOpacity={1} // Don't dim on TV, we use focus state instead
            hasTVPreferredFocus={hasTVPreferredFocus}
            tvParallaxProperties={{
                enabled: true,
                magnification: 1.05,
            }}
            testID={testID}
            {...touchableProps}
        >
            <Animated.View style={[styles.container, animatedStyle]}>
                {children}

                {/* Focus border overlay */}
                {showFocusBorder && (
                    <Animated.View
                        style={[
                            styles.focusBorder,
                            focusBorderStyle,
                        ]}
                        pointerEvents="none"
                    />
                )}
            </Animated.View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    wrapper: {
        // Ensure focus events are captured
    },
    container: {
        position: 'relative',
    },
    focusBorder: {
        position: 'absolute',
        top: -TV_STYLES.focus.borderWidth,
        left: -TV_STYLES.focus.borderWidth,
        right: -TV_STYLES.focus.borderWidth,
        bottom: -TV_STYLES.focus.borderWidth,
    },
});

TVFocusable.displayName = 'TVFocusable';

export default TVFocusable;
