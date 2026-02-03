import RateLimit from '@/models/RateLimit';
import dbConnect from '@/lib/mongodb';

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetAt?: Date;
}

/**
 * Checks if an action is allowed for a given identifier based on rate limits.
 * 
 * @param identifier Unique identifier for the user/IP
 * @param action Name of the action (e.g., 'login', 'report')
 * @param limit Max number of allowed actions in the window
 * @param windowMs Time window in milliseconds
 */
export async function checkRateLimit(
    identifier: string,
    action: string,
    limit: number,
    windowMs: number
): Promise<RateLimitResult> {
    await dbConnect();

    const now = new Date();

    // Find existing record
    let record = await RateLimit.findOne({ identifier, action });

    // If no record exists or it has expired/reset
    if (!record || record.resetAt < now) {
        // Create/Update new window
        const resetAt = new Date(now.getTime() + windowMs);

        if (record) {
            record.count = 1;
            record.resetAt = resetAt;
        } else {
            record = new RateLimit({
                identifier,
                action,
                count: 1,
                resetAt,
            });
        }

        await record.save();
        return { success: true, remaining: limit - 1, resetAt };
    }

    // Check limit
    if (record.count >= limit) {
        return { success: false, remaining: 0, resetAt: record.resetAt };
    }

    // Increment count
    record.count += 1;
    await record.save();

    return {
        success: true,
        remaining: limit - record.count,
        resetAt: record.resetAt
    };
}
