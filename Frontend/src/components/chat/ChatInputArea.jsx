import { useState } from "react";

const QUICK_REPLIES = ["سلام، در دسترس هستید؟", "ساعت تحویل چنده؟", "آدرس دقیق رو بفرستید"];

export default function ChatInputArea({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white px-5 py-3">
      <div className="mb-3 flex flex-wrap gap-2">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => setText(reply)}
            className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition hover:border-primary-600 hover:text-primary-600"
          >
            {reply}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2">
        <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100">
          <i className="fa-solid fa-paperclip" />
        </button>
        <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100">
          <i className="fa-regular fa-image" />
        </button>

        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="پیام خود را بنویسید..."
          className="max-h-[100px] flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-base outline-none transition focus:border-primary-600"
        />

        <button
          onClick={handleSend}
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-primary-600 text-base text-white transition hover:bg-primary-700"
        >
          <i className="fa-solid fa-paper-plane" />
        </button>
      </div>
    </div>
  );
}
