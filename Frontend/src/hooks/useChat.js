import { useEffect, useState, useCallback } from "react";
import { fetchConversations, fetchConversationMessages } from "../services/api";

const CURRENT_USER_ID = 101; // علی رضایی — مطابق mockCurrentUser.id

export function useChat() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [rentalContext, setRentalContext] = useState(null);

  const [listStatus, setListStatus] = useState("loading");
  const [messagesStatus, setMessagesStatus] = useState("idle");

  useEffect(() => {
    fetchConversations()
      .then((data) => {
        setConversations(data);
        setListStatus("success");
        if (data.length > 0) setActiveConversationId(data[0].id);
      })
      .catch(() => setListStatus("error"));
  }, []);

  useEffect(() => {
    if (!activeConversationId) return;
    setMessagesStatus("loading");
    fetchConversationMessages(activeConversationId)
      .then((data) => {
        setMessages(data.messages);
        setRentalContext(data.rental_context);
        setMessagesStatus("success");
      })
      .catch(() => setMessagesStatus("error"));
  }, [activeConversationId]);

  const sendMessage = useCallback((content) => {
    // فعلاً فقط به state محلی اضافه می‌شه — وقتی Chat API واقعی (وب‌سوکت یا
    // پولینگ) وصل شد، اینجا باید POST بزنه و پیام را از پاسخ سرور بگیره.
    const newMessage = {
      id: Date.now(),
      sender_id: CURRENT_USER_ID,
      type: "text",
      content,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    messages,
    rentalContext,
    listStatus,
    messagesStatus,
    sendMessage,
    currentUserId: CURRENT_USER_ID,
  };
}
