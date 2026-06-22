// lib/validateEmail.ts
import validator from "validator";
import disposableDomains from "disposable-email-domains";
import dns from "dns";

const disposableSet = new Set(disposableDomains);

export interface EmailValidationResult {
    valid: boolean;
    reason?: string;
}

/**
 * Validates an email address in three layers:
 * 1. Syntax (RFC-compliant format)
 * 2. Disposable/temp-mail domain block
 * 3. MX record check (does the domain actually accept mail?)
 *
 * No email is sent — this is a silent, automatic check.
 */
export async function validateEmail(email: string): Promise<EmailValidationResult> {
    const trimmed = email.trim().toLowerCase();

    // 1. Syntax check
    if (!validator.isEmail(trimmed)) {
        return { valid: false, reason: "This doesn't look like a valid email address." };
    }

    const domain = trimmed.split("@")[1];

    // 2. Disposable domain check
    if (disposableSet.has(domain)) {
        return { valid: false, reason: "Temporary or disposable email addresses aren't allowed." };
    }

    // 3. MX record check — confirms the domain can receive mail
    try {
        const records = await dns.promises.resolveMx(domain);
        if (!records || records.length === 0) {
            return { valid: false, reason: "This email domain can't receive mail. Double-check for typos." };
        }
    } catch (err) {
        // Domain doesn't exist or has no mail server at all
        return { valid: false, reason: "This email domain doesn't seem to exist. Double-check for typos." };
    }

    return { valid: true };
}

/**
 * Validates a list of emails, returning the first failure if any.
 */
export async function validateEmails(emails: string[]): Promise<EmailValidationResult> {
    if (emails.length === 0) {
        return { valid: false, reason: "At least one contact email is required." };
    }

    for (const email of emails) {
        const result = await validateEmail(email);
        if (!result.valid) {
            return { valid: false, reason: `"${email}" — ${result.reason}` };
        }
    }

    return { valid: true };
}