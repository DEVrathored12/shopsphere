import request from "supertest";
import app from "../src/app.js";
import Category from "../src/models/Category.js";
import { createUser, authHeader } from "./helpers.js";

describe("Categories", () => {
  test("GET /api/categories returns only active categories publicly", async () => {
    await Category.create([
      { name: "Food & Grocery", slug: "food-grocery", isActive: true },
      { name: "Retired Category", slug: "retired-category", isActive: false },
    ]);

    const res = await request(app).get("/api/categories");

    expect(res.status).toBe(200);
    expect(res.body.data.categories).toHaveLength(1);
    expect(res.body.data.categories[0].name).toBe("Food & Grocery");
  });

  test("POST /api/categories requires admin", async () => {
    const { token } = await createUser({ role: "customer" });

    const res = await request(app)
      .post("/api/categories")
      .set(authHeader(token))
      .send({ name: "Electronics" });

    expect(res.status).toBe(403);
  });

  test("Admin can create, update, and delete a category", async () => {
    const { token } = await createUser({ role: "admin" });

    const createRes = await request(app)
      .post("/api/categories")
      .set(authHeader(token))
      .send({ name: "Electronics" });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.category.slug).toBe("electronics");
    const id = createRes.body.data.category._id;

    const updateRes = await request(app)
      .put(`/api/categories/${id}`)
      .set(authHeader(token))
      .send({ description: "Gadgets and gizmos" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.category.description).toBe("Gadgets and gizmos");

    const deleteRes = await request(app).delete(`/api/categories/${id}`).set(authHeader(token));

    expect(deleteRes.status).toBe(200);

    const fetchRes = await request(app).get(`/api/categories/${id}`);
    expect(fetchRes.status).toBe(404);
  });

  test("Admin cannot delete a category still in use", async () => {
    const { token } = await createUser({ role: "admin" });
    const category = await Category.create({ name: "Fashion", slug: "fashion" });

    const { token: ownerToken } = await createUser({ role: "shop_owner", email: "owner@example.com" });
    await request(app)
      .post("/api/shops")
      .set(authHeader(ownerToken))
      .send({
        shopName: "Trendy Threads",
        category: category._id,
        description: "Clothes",
        phone: "9998887777",
        address: "123 Main St",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302001",
      });

    const res = await request(app).delete(`/api/categories/${category._id}`).set(authHeader(token));
    expect(res.status).toBe(409);
  });
});
