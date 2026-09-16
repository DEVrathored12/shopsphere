import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../context/ToastContext";
import {
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/adminService";
import { Badge, Button, Input, Textarea, Modal, LoadingSkeleton, ErrorState, ConfirmDialog } from "../../components/ui";

export default function AdminCategories() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create, object = edit
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data, loading, error, retry } = useAsync(() => fetchAdminCategories(), []);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (cat) => { setEditing(cat); setModalOpen(true); };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCategory(toDelete._id);
      toast.success("Category deleted.");
      retry();
    } catch (err) {
      toast.error(err.message || "Could not delete category.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Categories</h1>
        <Button icon={Plus} onClick={openCreate}>Add Category</Button>
      </div>

      {loading && <LoadingSkeleton count={6} />}
      {error && <ErrorState onRetry={retry} />}

      {!loading && !error && (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          {data?.length === 0 && (
            <p className="text-sm text-secondary text-center py-10">No categories yet.</p>
          )}
          {data?.map((cat, i) => (
            <div key={cat._id} className={`flex items-center gap-4 px-4 py-3 ${i !== 0 ? "border-t border-border" : ""}`}>
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 text-lg">
                  {cat.icon || "🏷️"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-primary">{cat.name}</p>
                <p className="text-xs text-secondary">{cat.shopCount} shops · {cat.productCount} products</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge tone={cat.isActive ? "success" : "danger"}>{cat.isActive ? "Active" : "Inactive"}</Badge>
                <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(cat)} />
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Trash2}
                  className="text-danger hover:bg-danger/5"
                  onClick={() => setToDelete(cat)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSaved={() => { setModalOpen(false); retry(); }}
        toast={toast}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete category?"
        description={`"${toDelete?.name}" will be permanently deleted. This will fail if shops or products still use it.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

function CategoryModal({ open, onClose, editing, onSaved, toast }) {
  const [form, setForm] = useState(() => ({
    name: editing?.name || "",
    description: editing?.description || "",
    icon: editing?.icon || "",
    image: editing?.image || "",
    isActive: editing?.isActive ?? true,
  }));
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);

  // Reset form when modal opens with new data
  const handleOpen = () => {
    setForm({
      name: editing?.name || "",
      description: editing?.description || "",
      icon: editing?.icon || "",
      image: editing?.image || "",
      isActive: editing?.isActive ?? true,
    });
    setErrors([]);
  };

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);
    try {
      if (editing) {
        await updateCategory(editing._id, form);
        toast.success("Category updated.");
      } else {
        await createCategory(form);
        toast.success("Category created.");
      }
      onSaved();
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message || "Could not save category."]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit Category" : "Add Category"} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && (
          <div className="rounded-lg bg-danger/10 text-danger text-sm px-3 py-2 space-y-0.5">
            {errors.map((msg) => <p key={msg}>{msg}</p>)}
          </div>
        )}
        <Input label="Name *" value={form.name} onChange={(e) => set({ name: e.target.value })} required />
        <Textarea label="Description" value={form.description} onChange={(e) => set({ description: e.target.value })} rows={2} />
        <Input label="Icon (emoji or text)" placeholder="🛍️" value={form.icon} onChange={(e) => set({ icon: e.target.value })} />
        <Input label="Image URL" placeholder="https://…" value={form.image} onChange={(e) => set({ image: e.target.value })} />
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set({ isActive: e.target.checked })}
            className="w-4 h-4 accent-accent"
          />
          <span className="text-sm text-primary">Active (visible to customers)</span>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={submitting}>{editing ? "Save Changes" : "Create"}</Button>
        </div>
      </form>
    </Modal>
  );
}
