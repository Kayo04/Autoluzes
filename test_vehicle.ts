import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './models/User';

export interface IVehicle extends Document {
    _id: mongoose.Types.ObjectId;
    plate: string;
    make?: string;
    // model?: string; // Commented out to test conflict
    country: string;
    owner: mongoose.Types.ObjectId | IUser;
    createdAt: Date;
    updatedAt: Date;
}
