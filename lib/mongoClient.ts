import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

interface MongoClientCache {
    client: MongoClient | null;
    promise: Promise<MongoClient> | null;
}

declare global {
    var mongoClient: MongoClientCache | undefined;
}

let cached: MongoClientCache = global.mongoClient || { client: null, promise: null };

if (!global.mongoClient) {
    global.mongoClient = cached;
}

async function getMongoClient(): Promise<MongoClient> {
    if (cached.client) {
        return cached.client;
    }

    if (!cached.promise) {
        cached.promise = MongoClient.connect(MONGODB_URI).then((client) => {
            console.log('✅ MongoDB Native Client connected for GridFS');
            return client;
        });
    }

    try {
        cached.client = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.client;
}

export default getMongoClient;
