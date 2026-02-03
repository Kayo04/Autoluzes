import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';
import Notification from '@/models/Notification';
import Vehicle from '@/models/Vehicle';
import User from '@/models/User';
import { resend } from '@/lib/resend';
import ReportStatusEmail from '@/components/emails/ReportStatusEmail';
import React from 'react';

// POST: Acknowledge a report
export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { status, message } = body;

        if (!['acknowledged', 'resolved'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await connectDB();
        const userId = (session.user as any).id;

        // Find the report
        const report = await Report.findById(id).populate('vehicle');

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        // Verify ownership: The user must be the owner of the vehicle in the report
        const vehicle = await Vehicle.findOne({ _id: report.vehicle, owner: userId });

        if (!vehicle) {
            return NextResponse.json({ error: 'Unauthorized: You do not own the vehicle for this report' }, { status: 403 });
        }

        // Update report status
        report.status = status;
        if (message) {
            report.ownerResponse = message;
        }
        await report.save();

        // Create notification for the reporter (if they are a registered user)
        // Note: reporter field in Report is ObjectId, so we check if it exists
        if (report.reporter) {
            await Notification.create({
                recipient: report.reporter,
                type: status === 'resolved' ? 'report_resolved' : 'report_acknowledged',
                report: report._id,
                read: false,
            });

            // Send email to reporter
            try {
                // Fetch reporter details (User model)
                const reporterUser = await User.findById(report.reporter);

                if (reporterUser && reporterUser.email) {
                    await resend.emails.send({
                        from: 'Autoluzes <onboarding@resend.dev>',
                        to: reporterUser.email,
                        subject: status === 'resolved' ? `✅ Issue Resolved: ${report.plate}` : `👀 Report Acknowledged: ${report.plate}`,
                        react: React.createElement(ReportStatusEmail, {
                            plate: report.plate,
                            status: status as 'acknowledged' | 'resolved',
                            reportId: report._id.toString(),
                            ownerResponse: message,
                            updatedAt: new Date().toISOString(),
                        }),
                    });
                    console.log(`Status update email sent to ${reporterUser.email}`);
                }
            } catch (emailError) {
                console.error('Failed to send status email:', emailError);
            }
        }

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error('Error acknowledging report:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
