import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';

export interface IVehicle extends Document {
    _id: mongoose.Types.ObjectId;
    plate: string; // Normalized (uppercase, no special chars)
    make?: string;
    model?: string;
    country: string;
    owner: mongoose.Types.ObjectId | IUser;
    createdAt: Date;
    updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
    {
        plate: {
            type: String,
            required: [true, 'Plate number is required'],
            uppercase: true,
            trim: true,
            index: true, // Fast lookups for reporting
        },
        make: {
            type: String,
            trim: true,
        },
        model: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            default: 'PT',
            uppercase: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for unique plate per owner
VehicleSchema.index({ plate: 1, owner: 1 }, { unique: true });

const Vehicle: Model<IVehicle> = mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);

export default Vehicle;
