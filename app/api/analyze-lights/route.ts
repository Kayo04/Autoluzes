import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Valid light types that can be detected
const VALID_LIGHTS = [
    'left-headlight',
    'right-headlight',
    'left-front-indicator',
    'right-front-indicator',
    'fog-lights',
    'left-brake',
    'right-brake',
    'center-brake',
    'left-rear-indicator',
    'right-rear-indicator',
    'reverse-light',
    'license-plate-light',
] as const;

type LightType = typeof VALID_LIGHTS[number];

export async function POST(request: NextRequest) {
    try {
        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return NextResponse.json(
                {
                    error: 'AI service not configured',
                    details: 'Please add your GEMINI_API_KEY to .env.local file. Get your key from https://aistudio.google.com/apikey'
                },
                { status: 503 }
            );
        }

        const formData = await request.formData();
        const image = formData.get('image') as File;

        if (!image) {
            return NextResponse.json(
                { error: 'No image provided' },
                { status: 400 }
            );
        }

        // Convert image to base64
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');

        // Get the mime type
        const mimeType = image.type || 'image/jpeg';

        // Initialize Gemini Vision model
        // Using gemini-2.0-flash (confirmed available via ListModels)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Create the prompt
        const prompt = `You are an expert at analyzing vehicle images to identify faulty or non-functioning lights.

Analyze this car image carefully and identify which lights appear to be OFF, broken, or not working properly.

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "lights": ["light-id-1", "light-id-2"],
  "confidence": 0.85
}

Valid light IDs you can use:
- "left-headlight" - Left front headlight
- "right-headlight" - Right front headlight
- "left-front-indicator" - Left front turn signal
- "right-front-indicator" - Right front turn signal
- "fog-lights" - Front fog lights
- "left-brake" - Left rear brake light
- "right-brake" - Right rear brake light
- "center-brake" - Center high-mount brake light
- "left-rear-indicator" - Left rear turn signal
- "right-rear-indicator" - Right rear turn signal
- "reverse-light" - Reverse/backup lights
- "license-plate-light" - License plate illumination

Rules:
1. Only include lights that are clearly OFF or broken
2. If you cannot see a particular light in the image, do NOT include it
3. Confidence should be between 0 and 1
4. Return ONLY the JSON object, no other text
5. If no faulty lights are detected, return empty array: {"lights": [], "confidence": 1.0}

Example response:
{"lights": ["left-headlight", "fog-lights"], "confidence": 0.82}`;

        // Generate content with image
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Parse the AI response
        let parsedResponse: { lights: string[]; confidence: number };

        try {
            // Try to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            parsedResponse = JSON.parse(jsonMatch[0]);

            // Validate the response structure
            if (!Array.isArray(parsedResponse.lights)) {
                throw new Error('Invalid response structure');
            }

            // Filter to only valid light types
            parsedResponse.lights = parsedResponse.lights.filter((light) =>
                VALID_LIGHTS.includes(light as LightType)
            );

            // Ensure confidence is a number between 0 and 1
            if (typeof parsedResponse.confidence !== 'number') {
                parsedResponse.confidence = 0.5;
            }
            parsedResponse.confidence = Math.max(0, Math.min(1, parsedResponse.confidence));

        } catch (parseError) {
            console.error('Failed to parse AI response:', text);
            return NextResponse.json(
                {
                    error: 'Failed to parse AI response',
                    details: text,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            lights: parsedResponse.lights,
            confidence: parsedResponse.confidence,
            rawResponse: text, // For debugging
        });

    } catch (error) {
        console.error('Error analyzing image:', error);
        return NextResponse.json(
            {
                error: 'Failed to analyze image',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
