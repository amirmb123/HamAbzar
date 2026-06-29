import { useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useChat } from "../hooks/useChat";
import { toJalali, formatJalaliMonthLabel } from "../utils/jalali";
import { toPersianDigits } from "../utils/format";

import ChatHeader from "../components/chat/ChatHeader";
import ToolContextBanner from "../components/chat/ToolContextBanner";
import MessageBubble from "../components/chat/MessageBubble";
import DateSeparator from "../components/chat/DateSeparator";
import ChatInputArea from "../components/chat/ChatInputArea";
import Button from "../components/common/Button";

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

function formatDateRangeLabel(startIso, endIso) {
  const start = toJalali(startIso);
  const end = toJalali(endIso);
  const startMonth = formatJalaliMonthLabel(start.jy, start.jm).split(" ")[0];
  const endMonth = formatJalaliMonthLabel(end.jy, end.jm).split(" ")[0];
  const endYear = formatJalaliMonthLabel(end.jy, end.jm).split(" ")[1];
  if (startMonth === endMonth) {
    return `${toPersianDigits(start.jd)} تا ${toPersianDigits(end.jd)} ${endMonth} ${endYear}`;
  }
  return `${toPersianDigits(start.jd)} ${startMonth} تا ${toPersianDigits(end.jd)} ${endMonth} ${endYear}`;
}

export default function ChatPage() {
  const { rentalId } = useParams();
  const navigate = useNavigate();

  const { rental, rentalStatus, counterparty, messages, messagesStatus, sendMessage, isOwnMessage } =
    useChat(rentalId);

  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  if (rentalStatus === "loading") {
    return <div className="flex h-screen items-center justify-center text-gray-500">در حال بارگذاری...</div>;
  }

  if (rentalStatus === "error" || !rental || !counterparty) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-gray-500">
        <p>این گفتگو پیدا نشد یا دسترسی به آن ندارید.</p>
        <Link to="/my-rentals">
          <Button variant="outline">بازگشت به کرایه‌های من</Button>
        </Link>
      </div>
    );
  }

  // بنر بالای چت با همان شکلی که ToolContextBanner از قبل انتظار دارد
  const rentalContext = {
    tool: rental.tool,
    booking_code: rental.id,
    date_range_label: formatDateRangeLabel(rental.start_date, rental.end_date),
    rental_id: rental.id,
  };

  let lastDayLabel = null;

  return (
    <div dir="rtl" className="flex h-screen flex-col overflow-hidden bg-gray-50 font-sans">
      <ChatHeader counterparty={counterparty} onBack={() => navigate("/my-rentals")} />
      <ToolContextBanner rentalContext={rentalContext} />

      <div ref={scrollRef} className="thin-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-5">
        {messagesStatus === "loading" && (
          <div className="py-12 text-center text-gray-400">در حال بارگذاری پیام‌ها...</div>
        )}

        {messagesStatus === "error" && (
          <div className="py-12 text-center text-gray-400">پیام‌ها بارگذاری نشدند.</div>
        )}

        {messagesStatus === "success" && messages.length === 0 && (
          <div className="py-12 text-center text-gray-400">هنوز پیامی ارسال نشده — گفتگو را شروع کنید.</div>
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
                  isOutgoing={isOwnMessage(message)}
                  senderName={counterparty.full_name}
                />
              </div>
            );
          })}
      </div>

      <ChatInputArea onSend={sendMessage} />
    </div>
  );
}
