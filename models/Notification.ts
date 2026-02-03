import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';
import { IReport } from './Report';

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId | IUser;
    type: 'report_received' | 'report_acknowledged' | 'report_resolved';
    report: mongoose.Types.ObjectId | IReport;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['report_received', 'report_acknowledged', 'report_resolved'],
            required: true,
        },
        report: {
            type: Schema.Types.ObjectId,
            ref: 'Report',
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent model recompilation in development
// Force model release in development to allow schema updates
if (process.env.NODE_ENV === 'development') {
    if (mongoose.models.Notification) {
        delete mongoose.models.Notification;
    }
}

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
