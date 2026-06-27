import { useState } from "react";
import ConversationListItem from "./ConversationListItem";
import { formatRelativeChatTime } from "../../utils/chatTime";

const FILTERS = [
  { id: "all", label: "همه" },
  { id: "unread", label: "خوانده‌نشده" },
  { id: "active_rentals", label: "رزروهای فعال" },
];

export default function ConversationsPanel({ conversations, activeId, onSelect }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = conversations
    .filter((c) => c.counterparty.full_name.toLowerCase().includes(search.toLowerCase()))
    .filter((c) => {
      if (filter === "unread") return c.unread_count > 0;
      if (filter === "active_rentals") return Boolean(c.rental_id);
      return true;
    });

  return (
    <div className="flex h-full w-[360px] min-w-[300px] flex-col border-l border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 pb-3 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">چت‌ها</span>
          <button className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100">
            <i className="fa-solid fa-pen-to-square" />
          </button>
        </div>
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در گفتگوها..."
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 pr-9 text-sm outline-none transition focus:border-primary-600"
          />
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-100 px-4 py-3">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1 text-xs transition ${
              filter === f.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="thin-scrollbar flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">گفتگویی پیدا نشد</div>
        ) : (
          filtered.map((conv) => (
            <ConversationListItem
              key={conv.id}
              conversation={{
                ...conv,
                last_message_at: formatRelativeChatTime(conv.last_message_at),
              }}
              isActive={conv.id === activeId}
              onClick={() => onSelect(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
