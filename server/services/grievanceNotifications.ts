/**
 * Grievance Notification Service
 * 
 * Sends email and SMS notifications for grievance-related events
 * using the existing communications gateway infrastructure.
 */

import { storage } from "../storage";
import { logger } from "../logger";
import {
    EMAIL_GATEWAY_SETTING_KEY,
    SMS_GATEWAY_SETTING_KEY,
    type EmailGatewaySettingValue,
    type EmailGatewayProvider,
    type SmsGatewaySettingValue,
    type SmsGatewayProvider,
    getEmailProfileFromValue,
    extractLegacyEmailProfile,
} from "./notifications";
import { getSystemSettingRecord } from "./systemSettings";
import {
    sendTestEmail,
    sendTestSms,
    sendNicV2Sms,
    sendTwilioSms,
} from "./communications";

const log = logger.child({ module: "grievance-notifications" });

// ============================================================================
// NOTIFICATION TEMPLATES
// ============================================================================

const TEMPLATES = {
    // Template for owner when a grievance is created
    grievance_created: {
        sms: "Your grievance ({{TICKET_NUMBER}}) has been submitted successfully. We will review and respond soon. - HP Tourism",
        emailSubject: "Grievance Submitted - {{TICKET_NUMBER}}",
        emailBody: `Dear {{OWNER_NAME}},

Your grievance has been successfully submitted.

Ticket Number: {{TICKET_NUMBER}}
Subject: {{SUBJECT}}
Category: {{CATEGORY}}

We will review your grievance and respond shortly. You can track the status by logging into the HP Tourism portal.

Best regards,
HP Tourism Department`
    },

    // Template for owner when officer replies
    grievance_officer_reply: {
        sms: "HP Tourism: New response on your grievance {{TICKET_NUMBER}}. Please log in to view the reply.",
        emailSubject: "New Response on Grievance {{TICKET_NUMBER}}",
        emailBody: `Dear {{OWNER_NAME}},

There is a new response on your grievance ticket.

Ticket Number: {{TICKET_NUMBER}}
Subject: {{SUBJECT}}

Please log in to the HP Tourism portal to view the response and reply if needed.

Best regards,
HP Tourism Department`
    },

    // Template for officer when owner replies
    grievance_owner_reply: {
        // Note: Usually we don't SMS officers, but we can
        sms: "Grievance {{TICKET_NUMBER}} has a new reply from the property owner. Please review.",
        emailSubject: "New Owner Reply - Grievance {{TICKET_NUMBER}}",
        emailBody: `A property owner has replied to grievance {{TICKET_NUMBER}}.

Subject: {{SUBJECT}}

Please log in to review and respond.

- HP Tourism System`
    },

    // Template for owner when status changes
    grievance_status_changed: {
        sms: "HP Tourism: Your grievance {{TICKET_NUMBER}} status changed to {{STATUS}}. {{RESOLUTION_NOTES}}",
        emailSubject: "Grievance Status Update - {{TICKET_NUMBER}}",
        emailBody: `Dear {{OWNER_NAME}},

The status of your grievance has been updated.

Ticket Number: {{TICKET_NUMBER}}
Subject: {{SUBJECT}}
New Status: {{STATUS}}
{{RESOLUTION_SECTION}}

Please log in to the HP Tourism portal for details.

Best regards,
HP Tourism Department`
    },

    // Template for owner when grievance is resolved
    grievance_resolved: {
        sms: "HP Tourism: Good news! Your grievance {{TICKET_NUMBER}} has been resolved. Login to view details.",
        emailSubject: "Grievance Resolved - {{TICKET_NUMBER}}",
        emailBody: `Dear {{OWNER_NAME}},

We are pleased to inform you that your grievance has been resolved.

Ticket Number: {{TICKET_NUMBER}}
Subject: {{SUBJECT}}

Resolution Notes:
{{RESOLUTION_NOTES}}

If you have any further concerns, you may submit a new grievance through the portal.

Best regards,
HP Tourism Department`
    },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function renderTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/{{\\s*([^}]+)\\s*}}/g, (_, token) => {
        const key = token.trim();
        return variables[key] ?? "";
    });
}

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
        const record = await getSystemSettingRecord(EMAIL_GATEWAY_SETTING_KEY);
        if (!record) {
            log.warn("SMTP gateway not configured, skipping email");
            return false;
        }

        const value = (record.settingValue as EmailGatewaySettingValue) ?? {};
        const provider: EmailGatewayProvider = value.provider ?? "custom";
        const profile = getEmailProfileFromValue(value, provider) ?? extractLegacyEmailProfile(value);

        if (!profile?.host || !profile?.fromEmail || !profile?.password) {
            log.warn("SMTP settings incomplete, skipping email");
            return false;
        }

        await sendTestEmail(
            {
                host: profile.host,
                port: Number(profile.port) || 25,
                username: profile.username,
                password: profile.password,
                fromEmail: profile.fromEmail,
            },
            { to, subject, body }
        );

        log.info({ to: to.substring(0, 10) + "..." }, "Grievance email sent successfully");
        return true;
    } catch (error) {
        log.error({ err: error }, "Failed to send grievance email");
        return false;
    }
}

async function sendSmsNotification(mobile: string, message: string): Promise<boolean> {
    try {
        // Normalize phone number
        const normalizedMobile = mobile.replace(/^\+91|^91/, "").trim();
        if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
            log.warn({ mobile: normalizedMobile.slice(-4) }, "Invalid mobile number format");
            return false;
        }

        const record = await getSystemSettingRecord(SMS_GATEWAY_SETTING_KEY);
        if (!record) {
            log.warn("SMS gateway not configured, skipping SMS");
            return false;
        }

        const config = (record.settingValue as SmsGatewaySettingValue) ?? {};
        const provider: SmsGatewayProvider = config.provider ?? "nic";

        if (provider === "twilio") {
            const twilioConfig = config.twilio;
            if (!twilioConfig?.accountSid || !twilioConfig?.authToken || (!twilioConfig?.fromNumber && !twilioConfig?.messagingServiceSid)) {
                log.warn("Twilio settings incomplete");
                return false;
            }
            await sendTwilioSms(
                {
                    accountSid: twilioConfig.accountSid,
                    authToken: twilioConfig.authToken,
                    fromNumber: twilioConfig.fromNumber,
                    messagingServiceSid: twilioConfig.messagingServiceSid,
                },
                { mobile: normalizedMobile, message }
            );
        } else if (provider === "nic_v2") {
            const nicV2Config = config.nicV2;
            if (!nicV2Config?.username || !nicV2Config?.password || !nicV2Config?.senderId || !nicV2Config?.key || !nicV2Config?.templateId || !nicV2Config?.postUrl) {
                log.warn("NIC V2 settings incomplete");
                return false;
            }
            await sendNicV2Sms(
                {
                    username: nicV2Config.username,
                    password: nicV2Config.password,
                    senderId: nicV2Config.senderId,
                    templateId: nicV2Config.templateId,
                    key: nicV2Config.key,
                    postUrl: nicV2Config.postUrl,
                },
                { mobile: normalizedMobile, message }
            );
        } else {
            const nicConfig = config.nic;
            if (!nicConfig?.username || !nicConfig?.password || !nicConfig?.senderId || !nicConfig?.departmentKey || !nicConfig?.templateId || !nicConfig?.postUrl) {
                log.warn("NIC settings incomplete");
                return false;
            }
            await sendTestSms(
                {
                    username: nicConfig.username,
                    password: nicConfig.password,
                    senderId: nicConfig.senderId,
                    departmentKey: nicConfig.departmentKey,
                    templateId: nicConfig.templateId,
                    postUrl: nicConfig.postUrl,
                },
                { mobile: normalizedMobile, message }
            );
        }

        log.info({ mobile: normalizedMobile.slice(-4), provider }, "Grievance SMS sent successfully");
        return true;
    } catch (error) {
        log.error({ err: error }, "Failed to send grievance SMS");
        return false;
    }
}

// ============================================================================
// NOTIFICATION TRIGGERS
// ============================================================================

interface GrievanceNotificationParams {
    ticketNumber: string;
    subject: string;
    category: string;
    status?: string;
    resolutionNotes?: string;
    ownerName?: string;
    ownerEmail?: string;
    ownerMobile?: string;
}

/**
 * Notify owner that their grievance was submitted
 */
export async function notifyGrievanceCreated(params: GrievanceNotificationParams) {
    const variables: Record<string, string> = {
        TICKET_NUMBER: params.ticketNumber,
        SUBJECT: params.subject,
        CATEGORY: params.category,
        OWNER_NAME: params.ownerName || "Property Owner",
    };

    const template = TEMPLATES.grievance_created;

    // Send SMS
    if (params.ownerMobile) {
        const smsMessage = renderTemplate(template.sms, variables);
        sendSmsNotification(params.ownerMobile, smsMessage).catch(() => { });
    }

    // Send Email
    if (params.ownerEmail) {
        const emailSubject = renderTemplate(template.emailSubject, variables);
        const emailBody = renderTemplate(template.emailBody, variables);
        sendEmail(params.ownerEmail, emailSubject, emailBody).catch(() => { });
    }
}

/**
 * Notify owner when an officer replies to their grievance
 */
export async function notifyGrievanceOfficerReply(params: GrievanceNotificationParams) {
    const variables: Record<string, string> = {
        TICKET_NUMBER: params.ticketNumber,
        SUBJECT: params.subject,
        OWNER_NAME: params.ownerName || "Property Owner",
    };

    const template = TEMPLATES.grievance_officer_reply;

    // Send SMS
    if (params.ownerMobile) {
        const smsMessage = renderTemplate(template.sms, variables);
        sendSmsNotification(params.ownerMobile, smsMessage).catch(() => { });
    }

    // Send Email
    if (params.ownerEmail) {
        const emailSubject = renderTemplate(template.emailSubject, variables);
        const emailBody = renderTemplate(template.emailBody, variables);
        sendEmail(params.ownerEmail, emailSubject, emailBody).catch(() => { });
    }
}

/**
 * Notify owner when status changes
 */
export async function notifyGrievanceStatusChanged(params: GrievanceNotificationParams) {
    const variables: Record<string, string> = {
        TICKET_NUMBER: params.ticketNumber,
        SUBJECT: params.subject,
        OWNER_NAME: params.ownerName || "Property Owner",
        STATUS: (params.status || "updated").replace("_", " ").toUpperCase(),
        RESOLUTION_NOTES: params.resolutionNotes || "No additional notes.",
        RESOLUTION_SECTION: params.resolutionNotes
            ? `\nResolution Notes:\n${params.resolutionNotes}`
            : "",
    };

    // Use resolved template if status is resolved
    const template = params.status === "resolved"
        ? TEMPLATES.grievance_resolved
        : TEMPLATES.grievance_status_changed;

    // Send SMS
    if (params.ownerMobile) {
        const smsMessage = renderTemplate(template.sms, variables);
        sendSmsNotification(params.ownerMobile, smsMessage).catch(() => { });
    }

    // Send Email
    if (params.ownerEmail) {
        const emailSubject = renderTemplate(template.emailSubject, variables);
        const emailBody = renderTemplate(template.emailBody, variables);
        sendEmail(params.ownerEmail, emailSubject, emailBody).catch(() => { });
    }
}

export default {
    notifyGrievanceCreated,
    notifyGrievanceOfficerReply,
    notifyGrievanceStatusChanged,
};
