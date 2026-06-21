import { useState, useRef, useEffect } from "react";
import { Bot, X } from "lucide-react";
import api from "../services/api";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Xin chào! Mình là trợ lý du lịch của TourVN. Bạn cần tư vấn gì về các tour du lịch nhé? 🗺️",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat", {
        message: text,
        history: newMessages.slice(0, -1), // gửi lịch sử trước câu hỏi mới nhất
      });
      setMessages((prev) => [...prev, { role: "model", text: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Xin lỗi, mình đang gặp sự cố. Bạn vui lòng thử lại sau nhé!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nút nổi */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center transition"
        aria-label="Mở chatbot"
      >
        {open ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
      </button>

      {/* Khung chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[28rem] bg-white rounded-lg border border-gray-100 shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-teal-600 text-white px-4 py-3">
            <p className="font-semibold text-sm">Trợ lý du lịch TourVN</p>
            <p className="text-xs text-teal-100">
              Hỏi mình về các tour du lịch nhé!
            </p>
          </div>

          {/* Nội dung chat */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-teal-600 text-white rounded-br-none"
                      : "bg-white border border-gray-100 text-gray-700 rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 text-gray-400 text-sm px-3 py-2 rounded-lg rounded-bl-none">
                  Đang trả lời...
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Form nhập */}
          <form onSubmit={handleSend} className="flex border-t border-gray-100">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-teal-600 text-white px-4 text-sm font-medium hover:bg-teal-700 transition disabled:opacity-50"
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </>
  );
}
