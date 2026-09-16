import Modal from "./Modal";
import Button from "./Button";

/**
 * Confirmation dialog for destructive/irreversible actions (delete
 * shop, delete product, etc). Controlled via `open` + callbacks.
 */
export default function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      {description && <p className="text-sm text-secondary mb-6">{description}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
