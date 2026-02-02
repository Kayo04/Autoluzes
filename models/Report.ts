import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';
import { IVehicle } from './Vehicle';

export type LightType =
    | 'left-headlight'
    | 'right-headlight'
    | 'left-front-indicator'
    | 'right-front-indicator'
    | 'fog-lights'
    | 'left-brake'
    | 'right-brake'
    | 'center-brake'
    | 'left-rear-indicator'
    | 'right-rear-indicator'
    | 'reverse-light'
    | 'license-plate-light';

export interface IReport extends Document {
    _id: mongoose.Types.ObjectId;
    reporter: mongoose.Types.ObjectId | IUser;
    reporterName: string; // Cached for display
    plate: string; // Normalized plate that was reported
    vehicle?: mongoose.Types.ObjectId | IVehicle; // Matched vehicle (if found)
    selectedLights: LightType[];
    imageId?: mongoose.Types.ObjectId; // GridFS file ID for uploaded image
    detectionMethod: 'manual' | 'ai'; // How lights were identified
    aiConfidence?: number; // AI confidence score (0-1)
    photoId?: string; // GridFS file ID (deprecated, use imageId)
    notificationSent: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
    {
        reporter: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        reporterName: {
            type: String,
            required: true,
        },
        plate: {
            type: String,
            required: true,
            uppercase: true,
            index: true,
        },
        vehicle: {
            type: Schema.Types.ObjectId,
            ref: 'Vehicle',
        },
        selectedLights: {
            type: [String],
            required: true,
            validate: {
                validator: (v: string[]) => v.length > 0,
                message: 'At least one light must be selected',
            },
        },
        imageId: {
            type: Schema.Types.ObjectId,
        },
        detectionMethod: {
            type: String,
            enum: ['manual', 'ai'],
            required: true,
            default: 'manual',
        },
        aiConfidence: {
            type: Number,
            min: 0,
            max: 1,
        },
        photoId: {
            type: String,
        },
        notificationSent: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for finding reports by vehicle owner
ReportSchema.index({ vehicle: 1, createdAt: -1 });

// Force model release in development to allow schema updates
if (process.env.NODE_ENV === 'development') {
    if (mongoose.models.Report) {
        delete mongoose.models.Report;
    }
}

const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

export default Report;
