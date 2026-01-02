/**
 * Feature Flags Configuration
 * 
 * Controls visibility of features that are beyond the official HP Homestay Rules 2025 scope.
 * These features are preserved in code but hidden from the UI for policy compliance.
 * 
 * Set to `true` to enable, `false` to disable.
 */

export const FEATURE_FLAGS = {
    /**
     * Tourism Marketing Features
     * These are useful for promoting properties but NOT required by Annexure-I
     */

    // Amenities selection (AC, WiFi, TV, etc.) - for tourism discovery/filtering
    SHOW_AMENITIES_SELECTION: false,

    // Nearby attractions checkboxes (19 items) - for tourist interest matching
    SHOW_NEARBY_ATTRACTIONS: false,

    // Key location highlights - for promotional content
    SHOW_KEY_LOCATION_HIGHLIGHTS: false,

    /**
     * Future Features
     * Reserved for planned enhancements
     */

    // Post-approval tourism marketing module
    SHOW_TOURISM_MARKETING_MODULE: false,

    // Advanced room configuration (beds per room, etc.)
    SHOW_ADVANCED_ROOM_CONFIG: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
    return FEATURE_FLAGS[flag] === true;
}
