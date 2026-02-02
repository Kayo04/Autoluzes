import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import getMongoClient from './mongoClient';

let bucket: GridFSBucket | null = null;

async function getGridFSBucket(): Promise<GridFSBucket> {
    if (bucket) return bucket;

    const client: MongoClient = await getMongoClient();
    const db = client.db();
    bucket = new GridFSBucket(db, { bucketName: 'report_images' });

    return bucket;
}

/**
 * Upload an image to GridFS
 * @param buffer Image buffer
 * @param filename Original filename
 * @param contentType MIME type (e.g., 'image/jpeg')
 * @returns GridFS file ID
 */
export async function uploadImage(
    buffer: Buffer,
    filename: string,
    contentType: string = 'image/jpeg'
): Promise<ObjectId> {
    const bucket = await getGridFSBucket();

    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
            contentType,
            metadata: {
                uploadedAt: new Date(),
            },
        });

        uploadStream.on('error', reject);
        uploadStream.on('finish', () => {
            resolve(uploadStream.id as ObjectId);
        });

        uploadStream.write(buffer);
        uploadStream.end();
    });
}

/**
 * Retrieve an image from GridFS
 * @param fileId GridFS file ID
 * @returns Image buffer and metadata
 */
export async function getImage(fileId: ObjectId | string): Promise<{
    buffer: Buffer;
    contentType: string;
    filename: string;
}> {
    const bucket = await getGridFSBucket();
    const objectId = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;

    // Get file metadata
    const files = await bucket.find({ _id: objectId }).toArray();
    if (files.length === 0) {
        throw new Error('Image not found');
    }

    const file = files[0];

    // Download file
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const downloadStream = bucket.openDownloadStream(objectId);

        downloadStream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        downloadStream.on('error', reject);

        downloadStream.on('end', () => {
            resolve({
                buffer: Buffer.concat(chunks),
                contentType: file.contentType || 'image/jpeg',
                filename: file.filename || 'image.jpg',
            });
        });
    });
}

/**
 * Delete an image from GridFS
 * @param fileId GridFS file ID
 */
export async function deleteImage(fileId: ObjectId | string): Promise<void> {
    const bucket = await getGridFSBucket();
    const objectId = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;

    await bucket.delete(objectId);
}

/**
 * Check if an image exists in GridFS
 * @param fileId GridFS file ID
 * @returns true if image exists
 */
export async function imageExists(fileId: ObjectId | string): Promise<boolean> {
    const bucket = await getGridFSBucket();
    const objectId = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;

    const files = await bucket.find({ _id: objectId }).toArray();
    return files.length > 0;
}
