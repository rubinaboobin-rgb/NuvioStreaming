/**
 * TVNavigationRail Component
 * 
 * Left-side vertical navigation rail for Android TV.
 * Provides focus-navigable menu items for main app sections.
 */

import React, { useCallback, useState, memo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TV_STYLES, TV_COLORS, TV_ANIMATIONS } from '../../styles/tvStyles';
import TVFocusable from '../ui/TVFocusable';

export interface TVNavigationItem {
    key: string;
    label: string;
    icon: string;
    iconLibrary?: 'material' | 'ionicons';
    badge?: number;
}

export interface TVNavigationRailProps {
    /** Current active route key */
    activeRoute: string;
    /** Navigation items to display */
    items: TVNavigationItem[];
    /** Callback when item is selected */
    onItemPress: (key: string) => void;
    /** Whether navigation is currently focused (vs main content) */
    isFocused?: boolean;
    /** Callback when focus exits rail to main content */
    onFocusExit?: () => void;
}

interface NavItemProps {
    item: TVNavigationItem;
    isActive: boolean;
    index: number;
    onPress: () => void;
    hasTVPreferredFocus: boolean;
}

/**
 * Individual navigation item with focus handling
 */
const NavItem: React.FC<NavItemProps> = memo(({
    item,
    isActive,
    index,
    onPress,
    hasTVPreferredFocus,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleFocus = useCallback(() => {
        setIsFocused(true);
        Animated.spring(scaleAnim, {
            toValue: 1.1,
            ...TV_ANIMATIONS.spring,
        }).start();
    }, [scaleAnim]);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
        Animated.spring(scaleAnim, {
            toValue: 1,
            ...TV_ANIMATIONS.spring,
        }).start();
    }, [scaleAnim]);

    // Render icon based on library
    const IconComponent = item.iconLibrary === 'ionicons' ? Ionicons : MaterialIcons;
    const iconColor = isActive || isFocused ? TV_COLORS.focus : TV_COLORS.textSecondary;

    return (
        <TVFocusable
            onPress={onPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            hasTVPreferredFocus={hasTVPreferredFocus}
            scaleOnFocus={false}
            showFocusBorder={false}
            style={styles.navItemWrapper}
            testID={`nav-item-${item.key}`}
        >
            <Animated.View
                style={[
                    styles.navItem,
                    isActive && styles.navItemActive,
                    isFocused && styles.navItemFocused,
                    { transform: [{ scale: scaleAnim }] },
                ]}
            >
                {/* Active indicator */}
                {isActive && (
                    <View style={styles.activeIndicator} />
                )}

                {/* Icon container */}
                <View style={styles.iconContainer}>
                    <IconComponent
                        name={item.icon as any}
                        size={TV_STYLES.navRail.iconSize}
                        color={iconColor}
                    />

                    {/* Badge */}
                    {item.badge !== undefined && item.badge > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {item.badge > 99 ? '99+' : item.badge}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Label */}
                <Text
                    style={[
                        styles.navLabel,
                        (isActive || isFocused) && styles.navLabelActive,
                    ]}
                    numberOfLines={1}
                >
                    {item.label}
                </Text>
            </Animated.View>
        </TVFocusable>
    );
});

NavItem.displayName = 'NavItem';

/**
 * TVNavigationRail - Left-side navigation for Android TV
 */
const TVNavigationRail: React.FC<TVNavigationRailProps> = memo(({
    activeRoute,
    items,
    onItemPress,
    isFocused = true,
    onFocusExit,
}) => {
    const insets = useSafeAreaInsets();
    const railOpacity = useRef(new Animated.Value(1)).current;

    // Animate rail visibility based on focus
    useEffect(() => {
        Animated.timing(railOpacity, {
            toValue: isFocused ? 1 : 0.7,
            duration: TV_ANIMATIONS.focusIn.duration,
            useNativeDriver: true,
        }).start();
    }, [isFocused, railOpacity]);

    const handleItemPress = useCallback((key: string) => {
        onItemPress(key);
    }, [onItemPress]);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    paddingTop: insets.top + TV_STYLES.spacing.lg,
                    paddingBottom: insets.bottom + TV_STYLES.spacing.lg,
                    opacity: railOpacity,
                },
            ]}
        >
            {/* App logo/branding area */}
            <View style={styles.brandingArea}>
                <View style={styles.logoPlaceholder}>
                    <Text style={styles.logoText}>N</Text>
                </View>
            </View>

            {/* Navigation items */}
            <View style={styles.itemsContainer}>
                {items.map((item, index) => (
                    <NavItem
                        key={item.key}
                        item={item}
                        isActive={activeRoute === item.key}
                        index={index}
                        onPress={() => handleItemPress(item.key)}
                        hasTVPreferredFocus={index === 0 && isFocused}
                    />
                ))}
            </View>

            {/* Spacer */}
            <View style={styles.spacer} />
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    container: {
        width: TV_STYLES.navRail.width,
        backgroundColor: TV_COLORS.surface,
        borderRightWidth: 1,
        borderRightColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    brandingArea: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: TV_STYLES.spacing.lg,
        marginBottom: TV_STYLES.spacing.xl,
    },
    logoPlaceholder: {
        width: TV_STYLES.navRail.iconSize * 1.5,
        height: TV_STYLES.navRail.iconSize * 1.5,
        borderRadius: TV_STYLES.navRail.iconSize * 0.75,
        backgroundColor: TV_COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: TV_STYLES.fontSize.title,
        fontWeight: '700',
        color: TV_COLORS.text,
    },
    itemsContainer: {
        width: '100%',
        alignItems: 'center',
        gap: TV_STYLES.spacing.sm,
    },
    navItemWrapper: {
        width: '100%',
        paddingHorizontal: TV_STYLES.spacing.sm,
    },
    navItem: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: TV_STYLES.spacing.md,
        paddingHorizontal: TV_STYLES.spacing.sm,
        borderRadius: TV_STYLES.card.borderRadius,
        position: 'relative',
    },
    navItemActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    navItemFocused: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    activeIndicator: {
        position: 'absolute',
        left: 0,
        top: '25%',
        bottom: '25%',
        width: 3,
        backgroundColor: TV_COLORS.accent,
        borderRadius: 2,
    },
    iconContainer: {
        position: 'relative',
        marginBottom: TV_STYLES.spacing.xs,
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -10,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: TV_COLORS.error,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: TV_COLORS.text,
    },
    navLabel: {
        fontSize: 11,
        color: TV_COLORS.textSecondary,
        textAlign: 'center',
    },
    navLabelActive: {
        color: TV_COLORS.text,
        fontWeight: '600',
    },
    spacer: {
        flex: 1,
    },
});

TVNavigationRail.displayName = 'TVNavigationRail';

export default TVNavigationRail;
