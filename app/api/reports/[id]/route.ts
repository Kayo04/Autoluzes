import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';
import User from '@/models/User';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const report = await Report.findById(params.id)
            .populate('vehicle')
            .lean();

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        // Get reporter information
        let reportedBy = null;
        if (report.reporter) {
            const reporter = await User.findById(report.reporter).select('name email').lean();
            reportedBy = reporter;
        }

        return NextResponse.json({
            report: {
                ...report,
                reportedBy,
            },
        });
    } catch (error) {
        console.error('Error fetching report:', error);
        return NextResponse.json(
            { error: 'Failed to fetch report' },
            { status: 500 }
        );
    }
}
