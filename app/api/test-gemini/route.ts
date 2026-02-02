import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            return NextResponse.json({
                error: 'API key not configured',
                details: 'Please add GEMINI_API_KEY to .env.local'
            }, { status: 503 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Try to list models
        try {
            const models = await genAI.listModels();
            return NextResponse.json({
                success: true,
                apiKey: `${apiKey.substring(0, 10)}...`,
                models: models.map(m => ({
                    name: m.name,
                    displayName: m.displayName,
                    supportedMethods: m.supportedGenerationMethods
                }))
            });
        } catch (listError: any) {
            // If listing fails, try a simple generation
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent('Say hello');
            const response = await result.response;

            return NextResponse.json({
                success: true,
                message: 'API key works! Model listing not available, but generation works.',
                testResponse: response.text(),
                apiKey: `${apiKey.substring(0, 10)}...`
            });
        }

    } catch (error: any) {
        return NextResponse.json({
            error: 'Test failed',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
