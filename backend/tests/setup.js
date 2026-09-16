import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-do-not-use-in-production";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

jest.setTimeout(60000);

let mongod;

beforeAll(async () => {
  // Prefer a real MongoDB (e.g. in CI / sandboxes that block the
  // mongodb-memory-server binary download) when MONGO_TEST_URI is set.
  // Otherwise spin up an in-memory instance automatically.
  if (process.env.MONGO_TEST_URI) {
    await mongoose.connect(process.env.MONGO_TEST_URI);
  } else {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
