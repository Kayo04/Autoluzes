import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { vehicleSchema } from '@/lib/validation';
import { normalizePlate } from '@/lib/validation';

// GET all vehicles for the authenticated user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const vehicles = await Vehicle.find({ owner: (session.user as any).id }).sort({ createdAt: -1 });

        return NextResponse.json({ vehicles });
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST create a new vehicle
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = vehicleSchema.parse(body);

        await dbConnect();

        // Normalize the plate
        const normalizedPlate = normalizePlate(validatedData.plate);

        // Check if vehicle already exists for this user
        const existingVehicle = await Vehicle.findOne({
            plate: normalizedPlate,
            owner: (session.user as any).id,
        });

        if (existingVehicle) {
            return NextResponse.json(
                { error: 'You have already added this vehicle' },
                { status: 400 }
            );
        }

        const vehicle = await Vehicle.create({
            plate: normalizedPlate,
            make: validatedData.make,
            model: validatedData.model,
            country: validatedData.country,
            owner: (session.user as any).id,
        });

        return NextResponse.json({ vehicle }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating vehicle:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input data', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE a vehicle
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const vehicleId = searchParams.get('id');

        if (!vehicleId) {
            return NextResponse.json({ error: 'Vehicle ID required' }, { status: 400 });
        }

        await dbConnect();

        const vehicle = await Vehicle.findOneAndDelete({
            _id: vehicleId,
            owner: (session.user as any).id,
        });

        if (!vehicle) {
            return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
