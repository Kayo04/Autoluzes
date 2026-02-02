import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { registerSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = registerSchema.parse(body);

        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 12);

        // Create user
        const user = await User.create({
            name: validatedData.name,
            email: validatedData.email.toLowerCase(),
            password: hashedPassword,
            locale: 'pt', // Default to Portuguese
        });

        return NextResponse.json(
            {
                message: 'User created successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Registration error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input data', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
