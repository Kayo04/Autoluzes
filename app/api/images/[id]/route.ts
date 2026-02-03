import { NextRequest, NextResponse } from 'next/server';
import { getImage } from '@/lib/gridfs';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
        }

        try {
            const { buffer, contentType, filename } = await getImage(id);

            // Create response with image data
            // Convert Buffer to Uint8Array to satisfy Response BodyInit type
            return new Response(new Uint8Array(buffer), {
                headers: {
                    'Content-Type': contentType,
                    'Content-Length': buffer.length.toString(),
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            });
        } catch (error) {
            console.error('Error retrieving image:', error);
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error handling image request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
