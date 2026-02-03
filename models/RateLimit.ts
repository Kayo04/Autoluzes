import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRateLimit extends Document {
    identifier: string; // IP or User ID
    action: string;     // e.g., 'report_submit', 'register'
    count: number;
    resetAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>(
    {
        identifier: {
            type: String,
            required: true,
            index: true,
        },
        action: {
            type: String,
            required: true,
            index: true,
        },
        count: {
            type: Number,
            default: 0,
        },
        resetAt: {
            type: Date,
            required: true,
            index: { expires: 0 }, // TTL index: document is deleted after resetAt
        },
    }
);

// Compound index for fast lookups
RateLimitSchema.index({ identifier: 1, action: 1 });

// Force model release in development to allow schema updates
if (process.env.NODE_ENV === 'development') {
    if (mongoose.models.RateLimit) {
        delete mongoose.models.RateLimit;
    }
}

const RateLimit: Model<IRateLimit> = mongoose.models.RateLimit || mongoose.model<IRateLimit>('RateLimit', RateLimitSchema);

export default RateLimit;
