import { useEffect, useState, useCallback, useRef } from "react";
import { fetchRentalDetail, fetchRentalMessages, sendRentalMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

// طبق طراحی بک‌اند، چت realtime/وب‌سوکت نیست — لیست پیام‌ها هر ۵ ثانیه poll می‌شود.
const POLL_INTERVAL_MS = 5000;

/**
 * چت مخصوص یک رزرو (نه یک inbox سراسری — بک‌اند مفهوم «گفتگو»ی مستقل ندارد).
 * @param {number|string} rentalId
 */
export function useChat(rentalId) {
  const { user } = useAuth();

  const [rental, setRental] = useState(null);
  const [rentalStatus, setRentalStatus] = useState("loading");

  const [messages, setMessages] = useState([]);
  const [messagesStatus, setMessagesStatus] = useState("loading");

  const pollRef = useRef(null);

  // جزئیات رزرو (شامل owner/borrower) — یک‌بار لود می‌شود
  useEffect(() => {
    setRentalStatus("loading");
    fetchRentalDetail(rentalId)
      .then((data) => {
        setRental(data);
        setRentalStatus("success");
      })
      .catch(() => setRentalStatus("error"));
  }, [rentalId]);

  // لود پیام‌ها + polling
  const loadMessages = useCallback(() => {
    fetchRentalMessages(rentalId)
      .then((data) => {
        setMessages(data);
        setMessagesStatus("success");
      })
      .catch(() => setMessagesStatus("error"));
  }, [rentalId]);

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [loadMessages]);

  const sendMessage = useCallback(
    async (content) => {
      try {
        const newMessage = await sendRentalMessage(rentalId, content);
        setMessages((prev) => [...prev, newMessage]);
      } catch (err) {
        // فعلاً فقط لاگ می‌شود — می‌توان بعداً toast خطا اضافه کرد
        console.error("[chat] ارسال پیام ناموفق:", err);
      }
    },
    [rentalId]
  );

  // طرف مقابل این رزرو، بر اساس نقش کاربر فعلی (borrower یا owner)
  const counterparty =
    rental && user ? (user.id === rental.borrower.id ? rental.owner : rental.borrower) : null;

  // ⚠️ MessageSerializer سمت بک‌اند فقط sender_name برمی‌گرداند، نه sender_id.
  // چون هر چت رزرو دقیقاً بین دو نفر مشخص (borrower/owner) است، تشخیص پیام
  // «من» با مقایسه‌ی نام کاربر فعلی با sender_name انجام می‌شود.
  const isOwnMessage = useCallback((message) => message.sender_name === user?.full_name, [user]);

  return {
    rental,
    rentalStatus,
    counterparty,
    messages,
    messagesStatus,
    sendMessage,
    isOwnMessage,
  };
}
