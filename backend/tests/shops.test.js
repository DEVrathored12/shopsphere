import request from "supertest";
import app from "../src/app.js";
import Category from "../src/models/Category.js";
import Shop from "../src/models/Shop.js";
import { createUser, authHeader } from "./helpers.js";

const validShopPayload = (categoryId, overrides = {}) => ({
  shopName: "Trendy Threads",
  category: categoryId,
  description: "The best clothes in town",
  phone: "9998887777",
  address: "123 Main St",
  city: "Jaipur",
  state: "Rajasthan",
  pincode: "302001",
  ...overrides,
});

describe("Shops", () => {
  let category;

  beforeEach(async () => {
    category = await Category.create({ name: "Fashion", slug: "fashion" });
  });

  test("only a shop_owner (or admin) can create a shop", async () => {
    const { token } = await createUser({ role: "customer" });

    const res = await request(app)
      .post("/api/shops")
      .set(authHeader(token))
      .send(validShopPayload(category._id));

    expect(res.status).toBe(403);
  });

  test("create shop uses the JWT's user id, ignoring any client-supplied ownerId", async () => {
    const { user, token } = await createUser({ role: "shop_owner" });
    const { user: attacker } = await createUser({ role: "shop_owner", email: "attacker@example.com" });

    const res = await request(app)
      .post("/api/shops")
      .set(authHeader(token))
      .send(validShopPayload(category._id, { ownerId: attacker._id.toString() }));

    expect(res.status).toBe(201);
    expect(res.body.data.shop.ownerId).toBe(user._id.toString());
    expect(res.body.data.shop.slug).toBeTruthy();
  });

  test("get shop by id returns shop, category, products, and rating", async () => {
    const { user, token } = await createUser({ role: "shop_owner" });
    const createRes = await request(app)
      .post("/api/shops")
      .set(authHeader(token))
      .send(validShopPayload(category._id));

    const shopId = createRes.body.data.shop._id;

    const res = await request(app).get(`/api/shops/${shopId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.shop.shopName).toBe("Trendy Threads");
    expect(res.body.data.category.name).toBe("Fashion");
    expect(res.body.data.products).toEqual([]);
    expect(res.body.data.rating).toEqual({ average: 0, totalReviews: 0 });
    expect(res.body.data.owner.name).toBe(user.name);
    // Never leak sensitive owner fields.
    expect(res.body.data.owner.email).toBeUndefined();
    expect(res.body.data.owner.password).toBeUndefined();
  });

  test("owner can update their own shop", async () => {
    const { token } = await createUser({ role: "shop_owner" });
    const createRes = await request(app)
      .post("/api/shops")
      .set(authHeader(token))
      .send(validShopPayload(category._id));

    const shopId = createRes.body.data.shop._id;

    const res = await request(app)
      .put(`/api/shops/${shopId}`)
      .set(authHeader(token))
      .send({ description: "Updated description" });

    expect(res.status).toBe(200);
    expect(res.body.data.shop.description).toBe("Updated description");
  });

  test("a shop owner cannot edit another owner's shop", async () => {
    const { token: ownerToken } = await createUser({ role: "shop_owner", email: "owner1@example.com" });
    const { token: otherToken } = await createUser({ role: "shop_owner", email: "owner2@example.com" });

    const createRes = await request(app)
      .post("/api/shops")
      .set(authHeader(ownerToken))
      .send(validShopPayload(category._id));

    const shopId = createRes.body.data.shop._id;

    const res = await request(app)
      .put(`/api/shops/${shopId}`)
      .set(authHeader(otherToken))
      .send({ description: "Hijacked!" });

    expect(res.status).toBe(403);
  });

  test("a non-admin cannot set isVerified", async () => {
    const { token } = await createUser({ role: "shop_owner" });
    const createRes = await request(app)
      .post("/api/shops")
      .set(authHeader(token))
      .send(validShopPayload(category._id));

    const shopId = createRes.body.data.shop._id;

    const res = await request(app)
      .put(`/api/shops/${shopId}`)
      .set(authHeader(token))
      .send({ isVerified: true });

    expect(res.status).toBe(200);
    expect(res.body.data.shop.isVerified).toBe(false);
  });

  test("owner can delete their own shop", async () => {
    const { token } = await createUser({ role: "shop_owner" });
    const createRes = await request(app)
      .post("/api/shops")
      .set(authHeader(token))
      .send(validShopPayload(category._id));

    const shopId = createRes.body.data.shop._id;

    const res = await request(app).delete(`/api/shops/${shopId}`).set(authHeader(token));
    expect(res.status).toBe(200);

    const fetchRes = await request(app).get(`/api/shops/${shopId}`);
    expect(fetchRes.status).toBe(404);
  });

  test("admin can update and delete any shop", async () => {
    const { token: ownerToken } = await createUser({ role: "shop_owner" });
    const { token: adminToken } = await createUser({ role: "admin", email: "admin@example.com" });

    const createRes = await request(app)
      .post("/api/shops")
      .set(authHeader(ownerToken))
      .send(validShopPayload(category._id));

    const shopId = createRes.body.data.shop._id;

    const updateRes = await request(app)
      .put(`/api/shops/${shopId}`)
      .set(authHeader(adminToken))
      .send({ isVerified: true });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.shop.isVerified).toBe(true);

    const deleteRes = await request(app).delete(`/api/shops/${shopId}`).set(authHeader(adminToken));
    expect(deleteRes.status).toBe(200);
  });

  test("inactive shops do not appear in the public list or detail view", async () => {
    const { token } = await createUser({ role: "shop_owner" });
    const createRes = await request(app)
      .post("/api/shops")
      .set(authHeader(token))
      .send(validShopPayload(category._id));

    const shopId = createRes.body.data.shop._id;

    await request(app).put(`/api/shops/${shopId}`).set(authHeader(token)).send({ isActive: false });

    const listRes = await request(app).get("/api/shops");
    expect(listRes.body.data.shops).toHaveLength(0);

    const publicDetailRes = await request(app).get(`/api/shops/${shopId}`);
    expect(publicDetailRes.status).toBe(404);

    // But the owner can still see it.
    const ownerDetailRes = await request(app).get(`/api/shops/${shopId}`).set(authHeader(token));
    expect(ownerDetailRes.status).toBe(200);
  });

  test("supports pagination, city filter, and search", async () => {
    const { token } = await createUser({ role: "shop_owner" });

    await request(app)
      .post("/api/shops")
      .set(authHeader(token))
      .send(validShopPayload(category._id, { shopName: "Jaipur Fashion Hub", city: "Jaipur" }));
    await request(app)
      .post("/api/shops")
      .set(authHeader(token))
      .send(validShopPayload(category._id, { shopName: "Mumbai Style Store", city: "Mumbai" }));

    const cityRes = await request(app).get("/api/shops").query({ city: "jaipur" });
    expect(cityRes.body.data.shops).toHaveLength(1);
    expect(cityRes.body.data.shops[0].city).toBe("Jaipur");

    const searchRes = await request(app).get("/api/shops").query({ search: "Style" });
    expect(searchRes.body.data.shops).toHaveLength(1);
    expect(searchRes.body.data.shops[0].shopName).toBe("Mumbai Style Store");

    const pageRes = await request(app).get("/api/shops").query({ page: 1, limit: 1 });
    expect(pageRes.body.data.shops).toHaveLength(1);
    expect(pageRes.body.data.pagination.total).toBe(2);
    expect(pageRes.body.data.pagination.totalPages).toBe(2);
  });
});
