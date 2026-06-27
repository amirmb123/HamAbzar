import { useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";

import ConversationsPanel from "../components/chat/ConversationsPanel";
import ChatHeader from "../components/chat/ChatHeader";
import ToolContextBanner from "../components/chat/ToolContextBanner";
import MessageBubble from "../components/chat/MessageBubble";
import DateSeparator from "../components/chat/DateSeparator";
import TypingIndicator from "../components/chat/TypingIndicator";
import ChatInputArea from "../components/chat/ChatInputArea";

/** برچسب گروه‌بندی روزانه برای جداکننده‌ی تاریخ */
function getDayLabel(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return `امروز، ${date.toLocaleDateString("fa-IR", { day: "numeric", month: "long", year: "numeric" })}`;
  }
  return date.toLocaleDateString("fa-IR", { day: "numeric", month: "long", year: "numeric" });
}

export default function ChatPage() {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    messages,
    rentalContext,
    listStatus,
    messagesStatus,
    sendMessage,
    currentUserId,
  } = useChat();

  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  // گروه‌بندی پیام‌ها بر اساس روز برای نمایش جداکننده‌ی تاریخ
  let lastDayLabel = null;

  return (
    <div dir="rtl" className="flex h-screen overflow-hidden font-sans">
      {/* پنجره اصلی چت */}
      <div className="flex min-w-0 flex-1 flex-col bg-gray-50">
        {activeConversation ? (
          <>
            <ChatHeader
              counterparty={activeConversation.counterparty}
              onBack={() => setActiveConversationId(null)}
            />
            <ToolContextBanner rentalContext={rentalContext} />

            <div ref={scrollRef} className="thin-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-5">
              {messagesStatus === "loading" && (
                <div className="py-12 text-center text-gray-400">در حال بارگذاری پیام‌ها...</div>
              )}

              {messagesStatus === "success" &&
                messages.map((message) => {
                  const dayLabel = getDayLabel(message.created_at);
                  const showSeparator = dayLabel !== lastDayLabel;
                  lastDayLabel = dayLabel;

                  return (
                    <div key={message.id} className="flex flex-col">
                      {showSeparator && <DateSeparator label={dayLabel} />}
                      <MessageBubble
                        message={message}
                        isOutgoing={message.sender_id === currentUserId}
                        senderName={activeConversation.counterparty.full_name}
                      />
                    </div>
                  );
                })}

              {activeConversation.is_typing && (
                <TypingIndicator name={activeConversation.counterparty.full_name} />
              )}
            </div>

            <ChatInputArea onSend={sendMessage} />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            {listStatus === "loading" ? "در حال بارگذاری گفتگوها..." : "گفتگویی انتخاب نشده"}
          </div>
        )}
      </div>

      {/* پنل لیست گفتگوها (سمت راست، چون RTL) */}
      <ConversationsPanel
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
      />
    </div>
  );
}
