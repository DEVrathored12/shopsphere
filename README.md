# ShopSphere

**Discover Local. See More. Visit Smarter.**

ShopSphere is a hyperlocal discovery platform that connects local shop owners
with nearby customers. Customers can search shops, categories, and products,
see photos, prices, and availability before visiting, and reach a shop by
phone, WhatsApp, or directions. Shop owners can register, manage their shop,
and manage their product catalog. Admins moderate users, shops, products,
and categories.

This is a new, independent project. It has no connection to, and shares no
code, database, or environment with, any prior project.

## Tech Stack

**Frontend:** React (Vite), React Router, Tailwind CSS, Axios, React Hook
Form, Zod, Lucide React, Framer Motion

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Helmet, CORS,
express-rate-limit, Multer

**Images:** Cloudinary

**Deployment targets:** Vercel (frontend), Render (backend), MongoDB Atlas,
Cloudinary, GitHub

## Folder Structure

```
shopsphere/
├── frontend/           React + Vite app
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── context/
│       ├── hooks/
│       ├── services/
│       ├── utils/
│       └── routes/
├── backend/            Node + Express API
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       ├── services/
│       ├── utils/
│       └── validators/
├── README.md
└── .gitignore
```

## Installation

```bash
# Clone and enter the project
git clone <your-repo-url> shopsphere
cd shopsphere

# Backend
cd backend
npm install
cp .env.example .env   # fill in real values
npm run dev             # http://localhost:5000

# Frontend (in a new terminal)
cd frontend
npm install
cp .env.example .env    # set VITE_API_URL
npm run dev              # http://localhost:5173
```

## Environment Variables

**backend/.env**
| Variable | Description |
|---|---|
| `PORT` | Port the API server listens on |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `CLIENT_URL` | Frontend origin, used for CORS |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

**frontend/.env**
| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

## Development Commands

| Command | Where | Purpose |
|---|---|---|
| `npm run dev` | backend | Start API with nodemon (auto-restart) |
| `npm start` | backend | Start API with node |
| `npm run dev` | frontend | Start Vite dev server |
| `npm run build` | frontend | Production build |
| `npm run preview` | frontend | Preview production build locally |

## API Reference (Shops, Categories, Products)

All responses use `{ success, message?, data? , errors? }`. Auth uses
`Authorization: Bearer <token>` from `/api/auth/login` or `/api/auth/register`.

### Categories

| Method | Route | Access |
|---|---|---|
| GET | `/api/categories` | Public — active only (admin can pass `?all=true`) |
| GET | `/api/categories/:id` | Public |
| POST | `/api/categories` | Admin |
| PUT | `/api/categories/:id` | Admin |
| DELETE | `/api/categories/:id` | Admin — blocked (409) if shops/products still use it |

Seed the 8 default categories (Food & Grocery, Fashion, Electronics,
Jewellery, Beauty, Home & Furniture, Gifts, Services):
```bash
npm run seed:categories
```

### Shops

| Method | Route | Access |
|---|---|---|
| GET | `/api/shops` | Public — active only |
| GET | `/api/shops/:id` | Public (owner/admin also see their own inactive shop) |
| POST | `/api/shops` | `shop_owner` or `admin` |
| PUT | `/api/shops/:id` | Shop owner or admin |
| DELETE | `/api/shops/:id` | Shop owner or admin (cascades to the shop's products) |

`GET /api/shops` query params: `page`, `limit`, `category` (categoryId),
`city`, `area`, `search`, `sort` (e.g. `sort=rating:desc`).

`POST /api/shops` required: `shopName, category, description, phone,
address, city, state, pincode`. Optional: `whatsapp, instagram, website,
area, openingHours, location, coverImage, galleryImages`. `ownerId` always
comes from the JWT and `isVerified`/`rating`/`totalReviews`/`slug` are
never client-writable (only an admin can set `isVerified`).

`GET /api/shops/:id` returns `{ shop, category, owner, products, rating,
gallery }` — owner data is limited to `name`/`avatar`; passwords, emails,
and tokens are never included.

### Products

| Method | Route | Access |
|---|---|---|
| GET | `/api/products` | Public — active products of active shops only |
| GET | `/api/products/:id` | Public (owner/admin also see their own inactive product) |
| POST | `/api/products` | Shop owner (of that shop) or admin |
| PUT | `/api/products/:id` | Owner of the product's shop, or admin |
| DELETE | `/api/products/:id` | Owner of the product's shop, or admin |

`GET /api/products` query params: `shopId`, `categoryId`, `search`,
`availability` (`available`/`out_of_stock`), `page`, `limit`, `sort`
(e.g. `sort=price:asc`).

`POST /api/products` required: `shopId, name, categoryId`. Optional:
`description, price, priceType (fixed|starting_from|contact_shop), images,
sizes, colors, availability`. The `shopId` is always re-verified against
the authenticated user's own shop server-side — a shop owner cannot
create a product under someone else's shop by passing a different id.

`GET /api/products/:id` increments `views`, debounced per-visitor for 30
minutes so refreshes don't inflate the count.

## Testing

Integration tests use Jest + Supertest against a real Mongoose connection:

```bash
cd backend
npm install
npm test
```

By default this spins up `mongodb-memory-server`, which downloads a
`mongod` binary the first time it runs (needs outbound internet access).
In an environment where that download is blocked, point tests at a real
MongoDB instead:

```bash
MONGO_TEST_URI="mongodb://localhost:27017/shopsphere_test" npm test
```

Coverage includes: category CRUD + in-use delete protection; shop
create/read/update/delete with ownership enforcement, admin override,
`isActive` visibility rules, pagination/city/search filters; and the
same for products, plus the shopId-ownership check and debounced view
counter.

## Project Status

Built in phases. See commit history / project notes for what's implemented
so far (project init → backend foundation → database models → auth →
shop management → categories & products → ...). Payments, delivery, chat,
AI recommendations, subscriptions, and complex booking are intentionally
out of scope for the MVP.
