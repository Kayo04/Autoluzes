import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/gridfs';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const image = formData.get('image') as File;

        if (!image) {
            return NextResponse.json(
                { error: 'No image provided' },
                { status: 400 }
            );
        }

        // Convert to buffer
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to GridFS
        const imageId = await uploadImage(buffer, image.name, image.type);

        return NextResponse.json({
            imageId: imageId.toString(),
            success: true,
        });

    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        );
    }
}
