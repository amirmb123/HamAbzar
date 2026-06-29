import Avatar from "../common/Avatar";
import { formatMessageTime } from "../../utils/chatTime";

/**
 * بک‌اند فقط پیام متنی ساده دارد (content + is_read + created_at) —
 * بدون type، عکس، یا کارت پیشنهاد رزرو. این کامپوننت مطابق همان ساده‌سازی شده.
 */
export default function MessageBubble({ message, isOutgoing, senderName }) {
  return (
    <div className={`flex max-w-[64%] gap-2 ${isOutgoing ? "self-end flex-row-reverse" : "self-start"}`}>
      {!isOutgoing && (
        <div className="mt-auto shrink-0">
          <Avatar name={senderName} size="sm" />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div
          className={`rounded-lg px-3.5 py-2.5 text-base leading-relaxed ${
            isOutgoing
              ? "rounded-bl-[4px] bg-primary-600 text-white"
              : "rounded-br-[4px] border border-gray-100 bg-white text-gray-900"
          }`}
        >
          {message.content}
        </div>

        <div
          className={`px-1 text-[10px] text-gray-400 ${
            isOutgoing ? "flex items-center justify-end gap-1 text-left" : ""
          }`}
        >
          {formatMessageTime(message.created_at)}
          {isOutgoing && message.is_read && (
            <i className="fa-solid fa-check-double text-[11px] text-primary-500" />
          )}
        </div>
      </div>
    </div>
  );
}
