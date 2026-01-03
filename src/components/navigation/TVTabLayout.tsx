/**
 * TVTabLayout Component
 * 
 * Provides Android TV-specific layout with left navigation rail
 * and main content area with D-pad focus management.
 */

import React, { useState, useCallback, useRef, memo } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import TVNavigationRail, { TVNavigationItem } from './TVNavigationRail';
import { TV_COLORS } from '../../styles/tvStyles';

// Screen imports
import HomeScreen from '../../screens/HomeScreen';
import LibraryScreen from '../../screens/LibraryScreen';
import SearchScreen from '../../screens/SearchScreen';
import DownloadsScreen from '../../screens/DownloadsScreen';
import SettingsScreen from '../../screens/SettingsScreen';

export interface TVTabLayoutProps {
    /** Initial route to display */
    initialRoute?: string;
    /** Whether downloads tab is enabled */
    enableDownloads?: boolean;
}

// Define navigation items
const getNavigationItems = (enableDownloads: boolean): TVNavigationItem[] => {
    const items: TVNavigationItem[] = [
        { key: 'Home', label: 'Home', icon: 'home', iconLibrary: 'material' },
        { key: 'Library', label: 'Library', icon: 'heart', iconLibrary: 'material' },
        { key: 'Search', label: 'Search', icon: 'search', iconLibrary: 'material' },
    ];

    if (enableDownloads) {
        items.push({ key: 'Downloads', label: 'Downloads', icon: 'download', iconLibrary: 'material' });
    }

    items.push({ key: 'Settings', label: 'Settings', icon: 'settings', iconLibrary: 'material' });

    return items;
};

// Screen component map
const SCREEN_COMPONENTS: Record<string, React.ComponentType<any>> = {
    Home: HomeScreen,
    Library: LibraryScreen,
    Search: SearchScreen,
    Downloads: DownloadsScreen,
    Settings: SettingsScreen,
};

/**
 * TVTabLayout - Main layout for Android TV with side navigation rail
 */
const TVTabLayout: React.FC<TVTabLayoutProps> = memo(({
    initialRoute = 'Home',
    enableDownloads = true,
}) => {
    const { currentTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const [activeRoute, setActiveRoute] = useState(initialRoute);
    const [isRailFocused, setIsRailFocused] = useState(false);
    const previousRouteRef = useRef(initialRoute);

    // Get navigation items based on settings
    const navigationItems = getNavigationItems(enableDownloads);

    // Handle navigation item press
    const handleItemPress = useCallback((key: string) => {
        if (key !== activeRoute) {
            previousRouteRef.current = activeRoute;
            setActiveRoute(key);
        }
        // After selection, move focus to main content
        setIsRailFocused(false);
    }, [activeRoute]);

    // Handle focus exit from rail to main content
    const handleFocusExit = useCallback(() => {
        setIsRailFocused(false);
    }, []);

    // Get current screen component
    const CurrentScreen = SCREEN_COMPONENTS[activeRoute] || HomeScreen;

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.colors.darkBackground }]}>
            <StatusBar
                translucent
                barStyle="light-content"
                backgroundColor="transparent"
            />

            {/* Left Navigation Rail */}
            <TVNavigationRail
                activeRoute={activeRoute}
                items={navigationItems}
                onItemPress={handleItemPress}
                isFocused={isRailFocused}
                onFocusExit={handleFocusExit}
            />

            {/* Main Content Area */}
            <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
                <CurrentScreen />
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: TV_COLORS.background,
    },
});

TVTabLayout.displayName = 'TVTabLayout';

export default TVTabLayout;
