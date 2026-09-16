import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Upload, Loader2, CheckCircle } from "lucide-react";
import { createRequest } from "../../services/requestService";
import { uploadImage } from "../../services/uploadService";
import { useAuth } from "../../context/AuthContext";

export default function FindItemModal({ open, onClose }) {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const reset = () => {
    setDescription("");
    setPreview(null);
    setFile(null);
    setDone(false);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError("Image must be under 5 MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) { setError("Please describe what you're looking for"); return; }
    setLoading(true);
    setError("");
    try {
      let photo = "";
      if (file) {
        photo = await uploadImage(file);
      }
      await createRequest({ description: description.trim(), photo });
      setDone(true);
    } catch (err) {
      setError(err.message || "Failed to post request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
              <div>
                <h2 className="font-semibold text-primary text-lg">Can't find it? Ask shops!</h2>
                <p className="text-xs text-secondary mt-0.5">Upload a photo or describe the item — shops will respond.</p>
              </div>
              <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-secondary" />
              </button>
            </div>

            {done ? (
              <div className="px-6 py-10 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-primary">Request sent to all shops!</p>
                <p className="text-sm text-secondary mt-1">Shop owners will notify you if they have it. Check <strong>My Requests</strong> for responses.</p>
                <button
                  onClick={handleClose}
                  className="mt-6 px-6 py-2.5 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {/* Photo upload */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    <Camera className="w-4 h-4 inline mr-1.5" />Photo (optional)
                  </label>
                  {preview ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border">
                      <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setPreview(null); setFile(null); }}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => inputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-secondary" />
                      <p className="text-sm text-secondary">Click or drag photo here</p>
                      <p className="text-xs text-secondary/60">Max 5 MB</p>
                    </div>
                  )}
                  <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">What are you looking for? *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Blue denim jacket, size M, under ₹1500..."
                    rows={3}
                    maxLength={500}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-secondary/60 outline-none focus:ring-2 focus:ring-accent resize-none"
                  />
                  <p className="text-xs text-secondary/60 text-right mt-1">{description.length}/500</p>
                </div>

                {!user && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                    You need to <a href="/login" className="underline font-medium">log in</a> to post a request.
                  </p>
                )}

                {error && <p className="text-xs text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !user}
                  className="w-full py-3 rounded-full bg-accent text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting…</> : "Send to All Shops"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
