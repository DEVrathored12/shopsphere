import request from "supertest";
import app from "../src/app.js";
import Category from "../src/models/Category.js";
import { createUser, authHeader } from "./helpers.js";

const createShop = async (token, categoryId, overrides = {}) => {
  const res = await request(app)
    .post("/api/shops")
    .set(authHeader(token))
    .send({
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
  return res.body.data.shop;
};

const validProductPayload = (shopId, categoryId, overrides = {}) => ({
  shopId,
  categoryId,
  name: "Blue Denim Jacket",
  description: "Classic fit denim jacket",
  price: 1999,
  priceType: "fixed",
  images: ["https://example.com/jacket.jpg"],
  sizes: ["S", "M", "L"],
  colors: ["blue"],
  availability: "available",
  ...overrides,
});

describe("Products", () => {
  let category;

  beforeEach(async () => {
    category = await Category.create({ name: "Fashion", slug: "fashion" });
  });

  test("create category -> create shop -> create product -> read product", async () => {
    const { token } = await createUser({ role: "shop_owner" });
    const shop = await createShop(token, category._id);

    const createRes = await request(app)
      .post("/api/products")
      .set(authHeader(token))
      .send(validProductPayload(shop._id, category._id));

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.product.slug).toBeTruthy();
    const productId = createRes.body.data.product._id;

    const readRes = await request(app).get(`/api/products/${productId}`);
    expect(readRes.status).toBe(200);
    expect(readRes.body.data.product.name).toBe("Blue Denim Jacket");
    expect(readRes.body.data.product.views).toBe(1);

    // Rapid refresh shouldn't keep incrementing views.
    const readAgainRes = await request(app).get(`/api/products/${productId}`);
    expect(readAgainRes.body.data.product.views).toBe(1);
  });

  test("shopId is verified against the owner's own shop, not trusted blindly", async () => {
    const { token: ownerToken } = await createUser({ role: "shop_owner", email: "owner1@example.com" });
    const { token: otherOwnerToken } = await createUser({ role: "shop_owner", email: "owner2@example.com" });

    const shop = await createShop(ownerToken, category._id);

    const res = await request(app)
      .post("/api/products")
      .set(authHeader(otherOwnerToken))
      .send(validProductPayload(shop._id, category._id));

    expect(res.status).toBe(403);
  });

  test("owner can update and delete their own product", async () => {
    const { token } = await createUser({ role: "shop_owner" });
    const shop = await createShop(token, category._id);

    const createRes = await request(app)
      .post("/api/products")
      .set(authHeader(token))
      .send(validProductPayload(shop._id, category._id));

    const productId = createRes.body.data.product._id;

    const updateRes = await request(app)
      .put(`/api/products/${productId}`)
      .set(authHeader(token))
      .send({ price: 2499, availability: "out_of_stock" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.product.price).toBe(2499);
    expect(updateRes.body.data.product.availability).toBe("out_of_stock");

    const deleteRes = await request(app).delete(`/api/products/${productId}`).set(authHeader(token));
    expect(deleteRes.status).toBe(200);

    const readRes = await request(app).get(`/api/products/${productId}`);
    expect(readRes.status).toBe(404);
  });

  test("another owner cannot update or delete someone else's product", async () => {
    const { token: ownerToken } = await createUser({ role: "shop_owner", email: "owner1@example.com" });
    const { token: otherOwnerToken } = await createUser({ role: "shop_owner", email: "owner2@example.com" });

    const shop = await createShop(ownerToken, category._id);
    const createRes = await request(app)
      .post("/api/products")
      .set(authHeader(ownerToken))
      .send(validProductPayload(shop._id, category._id));

    const productId = createRes.body.data.product._id;

    const updateRes = await request(app)
      .put(`/api/products/${productId}`)
      .set(authHeader(otherOwnerToken))
      .send({ price: 1 });
    expect(updateRes.status).toBe(403);

    const deleteRes = await request(app)
      .delete(`/api/products/${productId}`)
      .set(authHeader(otherOwnerToken));
    expect(deleteRes.status).toBe(403);
  });

  test("admin can manage any product", async () => {
    const { token: ownerToken } = await createUser({ role: "shop_owner" });
    const { token: adminToken } = await createUser({ role: "admin", email: "admin@example.com" });

    const shop = await createShop(ownerToken, category._id);
    const createRes = await request(app)
      .post("/api/products")
      .set(authHeader(ownerToken))
      .send(validProductPayload(shop._id, category._id));

    const productId = createRes.body.data.product._id;

    const updateRes = await request(app)
      .put(`/api/products/${productId}`)
      .set(authHeader(adminToken))
      .send({ isActive: false });
    expect(updateRes.status).toBe(200);

    const deleteRes = await request(app).delete(`/api/products/${productId}`).set(authHeader(adminToken));
    expect(deleteRes.status).toBe(200);
  });

  test("supports categoryId, availability, search, and pagination filters", async () => {
    const { token } = await createUser({ role: "shop_owner" });
    const shop = await createShop(token, category._id);

    await request(app)
      .post("/api/products")
      .set(authHeader(token))
      .send(validProductPayload(shop._id, category._id, { name: "Red Sneakers", availability: "available" }));
    await request(app)
      .post("/api/products")
      .set(authHeader(token))
      .send(validProductPayload(shop._id, category._id, { name: "Green Sandals", availability: "out_of_stock" }));

    const availabilityRes = await request(app).get("/api/products").query({ availability: "out_of_stock" });
    expect(availabilityRes.body.data.products).toHaveLength(1);
    expect(availabilityRes.body.data.products[0].name).toBe("Green Sandals");

    const searchRes = await request(app).get("/api/products").query({ search: "Sneakers" });
    expect(searchRes.body.data.products).toHaveLength(1);

    const shopFilterRes = await request(app).get("/api/products").query({ shopId: shop._id });
    expect(shopFilterRes.body.data.products).toHaveLength(2);

    const pageRes = await request(app).get("/api/products").query({ shopId: shop._id, page: 1, limit: 1 });
    expect(pageRes.body.data.products).toHaveLength(1);
    expect(pageRes.body.data.pagination.total).toBe(2);
  });

  test("inactive product / inactive shop products are hidden from public listing", async () => {
    const { token } = await createUser({ role: "shop_owner" });
    const shop = await createShop(token, category._id);

    const createRes = await request(app)
      .post("/api/products")
      .set(authHeader(token))
      .send(validProductPayload(shop._id, category._id));
    const productId = createRes.body.data.product._id;

    await request(app).put(`/api/products/${productId}`).set(authHeader(token)).send({ isActive: false });

    const listRes = await request(app).get("/api/products");
    expect(listRes.body.data.products).toHaveLength(0);

    const detailRes = await request(app).get(`/api/products/${productId}`);
    expect(detailRes.status).toBe(404);

    // Owner can still see their own inactive product.
    const ownerDetailRes = await request(app).get(`/api/products/${productId}`).set(authHeader(token));
    expect(ownerDetailRes.status).toBe(200);
  });
});
