import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, CheckCircle, XCircle, Phone, Send, X, Loader2, Image as ImageIcon } from "lucide-react";
import {
  getOwnerRequests,
  respondToRequest,
  sendMessage,
  getMessages,
} from "../../services/requestService";
import { useAuth } from "../../context/AuthContext";

function ChatPanel({ request, onClose }) {
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
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <p className="font-semibold text-primary text-sm">{request.customerId?.name}</p>
            <p className="text-xs text-secondary truncate max-w-[260px]">{request.description}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-secondary" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {messages.length === 0 && (
            <p className="text-center text-xs text-secondary py-6">No messages yet. Say hello!</p>
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

        {/* Input */}
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

export default function OwnerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatRequest, setChatRequest] = useState(null);
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    getOwnerRequests()
      .then((d) => setRequests(d.requests || []))
      .finally(() => setLoading(false));
  }, []);

  const handleRespond = async (req, status) => {
    setResponding(req._id + status);
    try {
      await respondToRequest(req._id, status);
      setRequests((prev) =>
        prev.map((r) =>
          r._id === req._id
            ? { ...r, myResponse: { status, shopId: req.shopId, ownerId: null } }
            : r
        )
      );
    } finally {
      setResponding(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary mb-2">Customer Requests</h1>
      <p className="text-secondary text-sm mb-6">Customers looking for items — respond to let them know if you have it.</p>

      {requests.length === 0 && (
        <div className="text-center py-16 text-secondary">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No requests yet. Check back soon!</p>
        </div>
      )}

      <div className="space-y-4">
        {requests.map((req) => {
          const responded = req.myResponse;
          const canChat = responded?.status === "yes";

          return (
            <motion.div
              key={req._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-border rounded-2xl p-4 shadow-sm"
            >
              <div className="flex gap-3">
                {/* Photo */}
                {req.photo ? (
                  <img src={req.photo} alt="item" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-6 h-6 text-secondary/40" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-primary text-sm">{req.customerId?.name}</p>
                  <p className="text-secondary text-sm mt-0.5 line-clamp-2">{req.description}</p>
                  <p className="text-xs text-secondary/60 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                {responded ? (
                  <div className="flex items-center gap-2 flex-1">
                    {responded.status === "yes" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-full px-3 py-1">
                        <CheckCircle className="w-3.5 h-3.5" /> You said Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-full px-3 py-1">
                        <XCircle className="w-3.5 h-3.5" /> You said No
                      </span>
                    )}
                    {/* Change response */}
                    <button
                      onClick={() => handleRespond(req, responded.status === "yes" ? "no" : "yes")}
                      className="text-xs text-secondary underline hover:text-primary"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs text-secondary">Do you have this?</span>
                    <button
                      onClick={() => handleRespond(req, "yes")}
                      disabled={!!responding}
                      className="inline-flex items-center gap-1 text-xs font-medium bg-green-500 text-white rounded-full px-3 py-1.5 hover:bg-green-600 disabled:opacity-60"
                    >
                      {responding === req._id + "yes" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Yes
                    </button>
                    <button
                      onClick={() => handleRespond(req, "no")}
                      disabled={!!responding}
                      className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-secondary rounded-full px-3 py-1.5 hover:bg-gray-200 disabled:opacity-60"
                    >
                      {responding === req._id + "no" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      No
                    </button>
                  </div>
                )}

                {canChat && (
                  <button
                    onClick={() => setChatRequest(req)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-accent border border-accent/30 rounded-full px-3 py-1.5 hover:bg-accent/10 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Chat
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {chatRequest && <ChatPanel request={chatRequest} onClose={() => setChatRequest(null)} />}
      </AnimatePresence>
    </div>
  );
}
