import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';

// GET: Fetch notifications for the current user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const userId = (session.user as any).id;

        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'report',
                select: 'plate selectedLights createdAt reporterName', // Select necessary fields
            })
            .limit(50) // Limit to 50 most recent
            .lean();

        // Count unread notifications
        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            read: false,
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Mark notifications as read
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const userId = (session.user as any).id;
        const body = await request.json();
        const { notificationIds, markAllAsRead } = body;

        if (markAllAsRead) {
            await Notification.updateMany(
                { recipient: userId, read: false },
                { $set: { read: true } }
            );
        } else if (notificationIds && Array.isArray(notificationIds)) {
            await Notification.updateMany(
                { _id: { $in: notificationIds }, recipient: userId },
                { $set: { read: true } }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
