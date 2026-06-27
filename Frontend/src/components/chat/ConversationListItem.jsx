import Avatar from "../common/Avatar";
import { toPersianDigits } from "../../utils/format";

export default function ConversationListItem({ conversation, isActive, onClick }) {
  const { counterparty, tool, last_message_preview, last_message_at, unread_count, is_typing } =
    conversation;
  const isUnread = unread_count > 0;

  return (
    <button
      onClick={onClick}
      className={`relative flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-right transition ${
        isActive ? "bg-primary-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="relative shrink-0">
        <Avatar name={counterparty.full_name} src={counterparty.avatar} size="md" />
        {counterparty.is_online && (
          <div className="absolute bottom-0 left-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#22C55E]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-gray-900">{counterparty.full_name}</span>
          <span className="whitespace-nowrap text-xs text-gray-400">{last_message_at}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={`truncate text-sm ${
              isUnread ? "font-medium text-gray-900" : "text-gray-500"
            } ${is_typing ? "text-primary-600" : ""}`}
          >
            {is_typing ? "در حال تایپ..." : last_message_preview}
          </span>
          {isUnread && (
            <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-primary-600 px-1.5 text-[10px] text-white">
              {toPersianDigits(unread_count)}
            </span>
          )}
        </div>
        {tool && (
          <span className="mt-1 inline-block rounded-full bg-primary-50 px-1.5 py-0.5 text-xs text-primary-600">
            {tool.name}
          </span>
        )}
      </div>
    </button>
  );
}
