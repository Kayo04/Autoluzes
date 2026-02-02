import { z } from 'zod';

/**
 * Normalizes a license plate by converting to uppercase and removing special characters
 * Example: "AA-00-BB" becomes "AA00BB"
 */
export function normalizePlate(plate: string): string {
    return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Zod schemas for validation
 */
export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const vehicleSchema = z.object({
    plate: z.string().min(2, 'Plate number is required'),
    make: z.string().optional(),
    model: z.string().optional(),
    country: z.string().default('PT'),
});

export const reportSchema = z.object({
    plate: z.string().min(2, 'Plate number is required'),
    selectedLights: z.array(z.string()).min(1, 'Select at least one light'),
    imageId: z.string().optional(),
    detectionMethod: z.enum(['manual', 'ai']).optional(),
});
