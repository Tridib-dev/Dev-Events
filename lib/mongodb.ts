import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set in the environment.");
}

const VERIFIED_MONGODB_URI: string = MONGODB_URI;

type MongooseConnectionCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseConnectionCache;
};

const cached = globalForMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalForMongoose.mongooseCache = cached;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    if (cached.conn.connection.readyState === 1) {
      return cached.conn;
    }

    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    // Reuse one in-flight connection across hot reloads to avoid duplicate sockets.
    cached.promise = mongoose
      .connect(VERIFIED_MONGODB_URI, {
        bufferCommands: false,
      })
      .catch((error: unknown) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  cached.promise = null;
  return cached.conn;
}

export default connectToDatabase;
