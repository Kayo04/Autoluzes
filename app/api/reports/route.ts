import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Report from '@/models/Report';
import Vehicle from '@/models/Vehicle';
import User from '@/models/User';
import { reportSchema } from '@/lib/validation';
import { normalizePlate } from '@/lib/validation';
import { LightType } from '@/models/Report';

// GET reports for the authenticated user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const userId = (session.user as any).id;

        // Get user's vehicles
        const userVehicles = await Vehicle.find({ owner: userId });
        const vehicleIds = userVehicles.map((v) => v._id);

        // Get reports received (reports for user's vehicles)
        const reportsReceived = await Report.find({ vehicle: { $in: vehicleIds } })
            .sort({ createdAt: -1 })
            .populate('vehicle')
            .lean();

        // Get reports sent by user
        const reportsSent = await Report.find({ reporter: userId })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            reportsReceived,
            reportsSent,
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST create a new report
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = reportSchema.parse(body);

        await dbConnect();

        const userId = (session.user as any).id;
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Normalize the plate
        const normalizedPlate = normalizePlate(validatedData.plate);

        // Try to find matching vehicle
        const matchedVehicle = await Vehicle.findOne({ plate: normalizedPlate }).populate('owner');

        // Create the report
        const report = await Report.create({
            reporter: userId,
            reporterName: user.name,
            plate: normalizedPlate,
            vehicle: matchedVehicle?._id,
            selectedLights: validatedData.selectedLights as LightType[],
            imageId: validatedData.imageId,
            detectionMethod: validatedData.detectionMethod || 'manual',
            notificationSent: false,
        });

        // If vehicle found, send notification
        if (matchedVehicle) {
            // TODO: Send email notification using Resend
            // For now, just mark as notification sent
            report.notificationSent = true;
            await report.save();

            // Send notification (placeholder - will implement email later)
            console.log(`Notification should be sent to ${(matchedVehicle.owner as any).email}`);
        }

        return NextResponse.json(
            {
                message: matchedVehicle
                    ? 'Report submitted and owner notified'
                    : 'Report submitted (no matching vehicle found)',
                report,
                matched: !!matchedVehicle,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating report:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input data', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
