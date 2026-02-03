import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Report from '@/models/Report';
import Vehicle from '@/models/Vehicle';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { reportSchema } from '@/lib/validation';
import { normalizePlate } from '@/lib/validation';
import { LightType } from '@/models/Report';
import { resend } from '@/lib/resend';
import ReportReceivedEmail from '@/components/emails/ReportReceivedEmail';
import React from 'react';
import { checkRateLimit } from '@/lib/rateLimit';

// GET reports with pagination and filtering
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const userId = (session.user as any).id;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // If specific type is requested (for "View All" pages)
        if (type === 'received' || type === 'sent') {
            let reports = [];
            let total = 0;

            if (type === 'received') {
                const userVehicles = await Vehicle.find({ owner: userId });
                const vehicleIds = userVehicles.map((v) => v._id);

                total = await Report.countDocuments({ vehicle: { $in: vehicleIds } });
                reports = await Report.find({ vehicle: { $in: vehicleIds } })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('vehicle')
                    .lean();
            } else {
                total = await Report.countDocuments({ reporter: userId });
                reports = await Report.find({ reporter: userId })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();
            }

            return NextResponse.json({
                reports,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page,
                    limit
                }
            });
        }

        // Dashboard view (returns limiting set of both)
        // Get user's vehicles
        const userVehicles = await Vehicle.find({ owner: userId });
        const vehicleIds = userVehicles.map((v) => v._id);

        // Get reports received (limit 5 for dashboard)
        const reportsReceived = await Report.find({ vehicle: { $in: vehicleIds } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('vehicle')
            .lean();

        // Get reports sent by user (limit 5 for dashboard)
        const reportsSent = await Report.find({ reporter: userId })
            .sort({ createdAt: -1 })
            .limit(5)
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

        // Rate Limiting: 5 reports per 10 minutes
        const rateLimitResult = await checkRateLimit(
            userId,
            'report_submit',
            5,
            10 * 60 * 1000 // 10 minutes
        );

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: 'Too many reports submitted. Please try again later.',
                    retryAfter: rateLimitResult.resetAt
                },
                { status: 429 }
            );
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
            // Create in-app notification
            await Notification.create({
                recipient: (matchedVehicle.owner as any)._id,
                type: 'report_received',
                report: report._id,
                read: false,
            });

            // Send email notification using Resend
            try {
                await resend.emails.send({
                    from: 'Autoluzes <onboarding@resend.dev>', // Use default Resend testing usage or configured domain
                    to: (matchedVehicle.owner as any).email,
                    subject: `⚠️ Alert: Report Received for ${normalizedPlate}`,
                    react: React.createElement(ReportReceivedEmail, {
                        plate: normalizedPlate,
                        reporterName: user.name,
                        reportId: report._id.toString(),
                        vehicleMake: matchedVehicle.make,
                        vehicleModel: matchedVehicle.model,
                        selectedLights: validatedData.selectedLights,
                    }),
                });
                console.log(`Email sent to ${(matchedVehicle.owner as any).email}`);
                report.notificationSent = true;
                await report.save();
            } catch (emailError) {
                console.error('Failed to send email:', emailError);
                // Don't fail the request if email fails, just log it
            }
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

        return NextResponse.json({
            error: error.message || 'Internal server error',
            details: error.toString()
        }, { status: 500 });
    }
}
