import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, Pencil, KeyRound, LogOut } from "lucide-react";

import { Avatar, Button, Input, Modal } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { updateProfile, changePassword } from "../../services/authService";

export default function OwnerProfile() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-6">Profile</h1>

      <div className="bg-white border border-border rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatar} name={user?.name} size="lg" />
          <div>
            <p className="text-lg font-semibold text-primary">{user?.name}</p>
            <p className="text-sm text-secondary capitalize">Shop Owner</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <p className="flex items-center gap-2.5 text-sm text-primary">
            <Mail className="w-4 h-4 text-secondary shrink-0" /> {user?.email}
          </p>
          <p className="flex items-center gap-2.5 text-sm text-primary">
            <Phone className="w-4 h-4 text-secondary shrink-0" /> {user?.phone || "No phone number on file"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 mt-6">
          <Button icon={Pencil} onClick={() => setEditOpen(true)}>Edit Profile</Button>
          <Button variant="outline" icon={KeyRound} onClick={() => setPasswordOpen(true)}>Change Password</Button>
          <Button variant="ghost" icon={LogOut} className="text-danger hover:bg-danger/5" onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} user={user} onSaved={updateUser} toast={toast} />
      <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} toast={toast} />
    </div>
  );
}

function EditProfileModal({ open, onClose, user, onSaved, toast }) {
  const [form, setForm] = useState(() => ({ name: user?.name || "", phone: user?.phone || "", avatar: user?.avatar || "" }));
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);
    try {
      const updated = await updateProfile(form);
      onSaved(updated);
      toast.success("Profile updated!");
      onClose();
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message || "Could not update profile."]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && (
          <div className="rounded-lg bg-danger/10 text-danger text-sm px-3 py-2 space-y-0.5">
            {errors.map((msg) => <p key={msg}>{msg}</p>)}
          </div>
        )}
        <Input label="Name" value={form.name} onChange={(e) => set({ name: e.target.value })} />
        <Input label="Phone" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
        <Input label="Avatar image URL" placeholder="https://…" value={form.avatar} onChange={(e) => set({ avatar: e.target.value })} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={submitting}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}

function ChangePasswordModal({ open, onClose, toast }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);
    try {
      await changePassword(form);
      toast.success("Password changed successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      onClose();
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message || "Could not change password."]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Change Password" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && (
          <div className="rounded-lg bg-danger/10 text-danger text-sm px-3 py-2 space-y-0.5">
            {errors.map((msg) => <p key={msg}>{msg}</p>)}
          </div>
        )}
        <Input label="Current Password" type="password" value={form.currentPassword} onChange={(e) => set({ currentPassword: e.target.value })} />
        <Input label="New Password" type="password" value={form.newPassword} onChange={(e) => set({ newPassword: e.target.value })} />
        <Input label="Confirm New Password" type="password" value={form.confirmNewPassword} onChange={(e) => set({ confirmNewPassword: e.target.value })} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={submitting}>Change Password</Button>
        </div>
      </form>
    </Modal>
  );
}
