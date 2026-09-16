import { Routes, Route } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import CustomerLayout from "../layouts/CustomerLayout";
import OwnerLayout from "../layouts/OwnerLayout";
import AdminLayout from "../layouts/AdminLayout";

import RoleRoute from "./RoleRoute";

import Home from "../pages/public/Home";
import Explore from "../pages/public/Explore";
import Categories from "../pages/public/Categories";
import CategoryDetail from "../pages/public/CategoryDetail";
import ShopDetail from "../pages/public/ShopDetail";
import ProductDetail from "../pages/public/ProductDetail";
import ForBusiness from "../pages/public/ForBusiness";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import NotFound from "../pages/public/NotFound";
import Tutorial from "../pages/public/Tutorial";

import CustomerDashboard from "../pages/customer/Dashboard";
import Favorites from "../pages/customer/Favorites";
import RecentlyViewed from "../pages/customer/RecentlyViewed";
import CustomerProfile from "../pages/customer/Profile";

import OwnerDashboard from "../pages/owner/Dashboard";
import OwnerShop from "../pages/owner/Shop";
import OwnerShopCreate from "../pages/owner/ShopCreate";
import OwnerShopEdit from "../pages/owner/ShopEdit";
import OwnerProducts from "../pages/owner/Products";
import OwnerProductCreate from "../pages/owner/ProductCreate";
import OwnerProductEdit from "../pages/owner/ProductEdit";
import OwnerProfile from "../pages/owner/Profile";
import OwnerPhotos from "../pages/owner/Photos";
import { ComingSoon } from "../components/ui";

import AdminDashboard from "../pages/admin/Dashboard";
import AdminUsers from "../pages/admin/Users";
import AdminShops from "../pages/admin/Shops";
import AdminProducts from "../pages/admin/Products";
import AdminCategories from "../pages/admin/Categories";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------------- Public ---------------- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:slug" element={<CategoryDetail />} />
        <Route path="/shop/:shopId" element={<ShopDetail />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/for-business" element={<ForBusiness />} />
        <Route path="/about" element={<About />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ---------------- Customer ---------------- */}
      {/* RoleRoute (not just ProtectedRoute) so shop owners/admins can't
          reach a customer's dashboard just by being logged in. */}
      <Route element={<RoleRoute allowedRoles={["customer"]} />}>
        <Route element={<CustomerLayout />}>
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/recently-viewed" element={<RecentlyViewed />} />
          <Route path="/profile" element={<CustomerProfile />} />
        </Route>
      </Route>

      {/* ---------------- Shop owner ---------------- */}
      <Route element={<RoleRoute allowedRoles={["shop_owner"]} />}>
        <Route element={<OwnerLayout />}>
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/shop" element={<OwnerShop />} />
          <Route path="/owner/shop/create" element={<OwnerShopCreate />} />
          <Route path="/owner/shop/edit" element={<OwnerShopEdit />} />
          <Route path="/owner/products" element={<OwnerProducts />} />
          <Route path="/owner/products/create" element={<OwnerProductCreate />} />
          <Route path="/owner/products/:id/edit" element={<OwnerProductEdit />} />
          <Route path="/owner/photos" element={<OwnerPhotos />} />
          <Route path="/owner/profile" element={<OwnerProfile />} />
          <Route path="/owner/settings" element={<ComingSoon title="Settings" />} />
        </Route>
      </Route>

      {/* ---------------- Admin ---------------- */}
      <Route element={<RoleRoute allowedRoles={["admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/shops" element={<AdminShops />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
        </Route>
      </Route>
    </Routes>
  );
}
