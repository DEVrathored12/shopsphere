import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, CheckCircle, XCircle, Phone, Send, X, Loader2, Image as ImageIcon, Camera } from "lucide-react";
import { getMyRequests, sendMessage, getMessages } from "../../services/requestService";
import { useAuth } from "../../context/AuthContext";
import FindItemModal from "../../components/search/FindItemModal";

function ChatPanel({ request, shopResponse, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    getMessages(request._id).then((d) => setMessages(d.messages || []));
  }, [request._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const d = await sendMessage(request._id, text.trim());
      setMessages((prev) => [...prev, d.message]);
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 flex flex-col"
        style={{ maxHeight: "80vh" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <p className="font-semibold text-primary text-sm">{shopResponse.shopId?.shopName}</p>
            <p className="text-xs text-secondary">{shopResponse.shopId?.city}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {messages.length === 0 && (
            <p className="text-center text-xs text-secondary py-6">No messages yet. Start the conversation!</p>
          )}
          {messages.map((msg) => {
            const mine = msg.sender?._id === user._id || msg.sender === user._id;
            return (
              <div key={msg._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-accent text-white" : "bg-gray-100 text-primary"}`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-border">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 text-sm border border-border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="p-2.5 rounded-full bg-accent text-white hover:opacity-90 disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatState, setChatState] = useState(null); // { request, shopResponse }
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    getMyRequests()
      .then((d) => setRequests(d.requests || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-primary">My Requests</h1>
          <p className="text-secondary text-sm mt-1">Track shop responses to your item requests.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-accent text-white rounded-full px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Camera className="w-4 h-4" /> New Request
        </button>
      </div>

      {requests.length === 0 && (
        <div className="text-center py-16 text-secondary">
          <Camera className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-primary">No requests yet</p>
          <p className="text-sm mt-1">Post a photo or description of what you're looking for.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 bg-accent text-white rounded-full px-5 py-2.5 text-sm font-medium hover:opacity-90"
          >
            <Camera className="w-4 h-4" /> Ask Shops
          </button>
        </div>
      )}

      <div className="space-y-5">
        {requests.map((req) => (
          <motion.div
            key={req._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-border rounded-2xl p-4 shadow-sm"
          >
            {/* Request info */}
            <div className="flex gap-3 mb-3">
              {req.photo ? (
                <img src={req.photo} alt="item" className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5 text-secondary/40" />
                </div>
              )}
              <div>
                <p className="text-sm text-primary font-medium line-clamp-2">{req.description}</p>
                <p className="text-xs text-secondary/60 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Responses from shops */}
            {req.responses?.length === 0 && (
              <p className="text-xs text-secondary bg-gray-50 rounded-xl px-3 py-2">
                Waiting for shop responses…
              </p>
            )}

            {req.responses?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-secondary uppercase tracking-wide">Shop Responses</p>
                {req.responses.map((resp) => (
                  <div
                    key={resp._id || resp.shopId?._id}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${resp.status === "yes" ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{resp.shopId?.shopName || "Shop"}</p>
                      <p className="text-xs text-secondary">{resp.shopId?.city}</p>
                    </div>

                    {resp.status === "yes" ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                          <CheckCircle className="w-3.5 h-3.5" /> Has it!
                        </span>
                        {/* Show phone number when owner says yes */}
                        {resp.ownerId?.phone && (
                          <a
                            href={`tel:${resp.ownerId.phone}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-white bg-green-500 rounded-full px-2.5 py-1 hover:bg-green-600"
                          >
                            <Phone className="w-3 h-3" /> {resp.ownerId.phone}
                          </a>
                        )}
                        <button
                          onClick={() => setChatState({ request: req, shopResponse: resp })}
                          className="inline-flex items-center gap-1 text-xs font-medium text-accent border border-accent/30 rounded-full px-2.5 py-1 hover:bg-accent/10"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Chat
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-secondary shrink-0">
                        <XCircle className="w-3.5 h-3.5 text-red-400" /> Not available
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <FindItemModal open={modalOpen} onClose={() => { setModalOpen(false); load(); }} />

      <AnimatePresence>
        {chatState && (
          <ChatPanel
            request={chatState.request}
            shopResponse={chatState.shopResponse}
            onClose={() => setChatState(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
