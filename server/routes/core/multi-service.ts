import { eq } from "drizzle-orm";
import { db } from "../../db";
import { systemSettings } from "@shared/schema";
import { logger } from "../../logger";

const MULTI_SERVICE_HUB_KEY = "multi_service_hub_enabled";
const SETTING_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const multiServiceLog = logger.child({ module: "multi-service-settings" });

const settingCache: { fetchedAt: number; enabled: boolean } = {
    fetchedAt: 0,
    enabled: false, // default disabled (homestay-only mode)
};

export const updateMultiServiceCache = (enabled: boolean) => {
    settingCache.enabled = enabled;
    settingCache.fetchedAt = Date.now();
};

/**
 * Get the multi-service hub setting.
 * When enabled, users see the service selection page after login.
 * When disabled, users go directly to the homestay dashboard.
 */
export const getMultiServiceHubEnabled = async (): Promise<boolean> => {
    const now = Date.now();
    if (now - settingCache.fetchedAt < SETTING_CACHE_TTL) {
        return settingCache.enabled;
    }

    try {
        const [setting] = await db
            .select()
            .from(systemSettings)
            .where(eq(systemSettings.settingKey, MULTI_SERVICE_HUB_KEY))
            .limit(1);

        let enabled = false; // default to disabled
        if (setting?.settingValue !== undefined && setting?.settingValue !== null) {
            const value = setting.settingValue as { enabled?: boolean } | boolean;
            if (typeof value === "boolean") {
                enabled = value;
            } else if (typeof value === "object" && "enabled" in value) {
                enabled = Boolean(value.enabled);
            }
        }

        updateMultiServiceCache(enabled);
        return enabled;
    } catch (error) {
        multiServiceLog.error("[multi-service] Failed to fetch setting", error);
        return settingCache.enabled; // return cached value on error
    }
};

/**
 * Set the multi-service hub enabled state.
 */
export const setMultiServiceHubEnabled = async (enabled: boolean, updatedBy?: string): Promise<void> => {
    try {
        const [existing] = await db
            .select()
            .from(systemSettings)
            .where(eq(systemSettings.settingKey, MULTI_SERVICE_HUB_KEY))
            .limit(1);

        if (existing) {
            await db
                .update(systemSettings)
                .set({
                    settingValue: { enabled },
                    updatedAt: new Date(),
                    updatedBy: updatedBy || null,
                })
                .where(eq(systemSettings.settingKey, MULTI_SERVICE_HUB_KEY));
        } else {
            await db.insert(systemSettings).values({
                settingKey: MULTI_SERVICE_HUB_KEY,
                settingValue: { enabled },
                updatedBy: updatedBy || null,
            });
        }

        updateMultiServiceCache(enabled);
        multiServiceLog.info("[multi-service] Setting updated", { enabled, updatedBy });
    } catch (error) {
        multiServiceLog.error("[multi-service] Failed to update setting", error);
        throw error;
    }
};

export { MULTI_SERVICE_HUB_KEY };
