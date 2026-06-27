import { Link } from "react-router-dom";
import Avatar from "../common/Avatar";

export default function ChatHeader({ counterparty, onBack }) {
  return (
    <div className="flex h-[72px] items-center gap-3 border-b border-gray-200 bg-white px-5">
      <button
        onClick={onBack}
        className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-50 md:hidden"
      >
        <i className="fa-solid fa-arrow-right" />
      </button>

      <Avatar name={counterparty.full_name} src={counterparty.avatar} size="md" />

      <div className="flex-1">
        <div className="flex items-center gap-1.5 text-md font-semibold text-gray-900">
          {counterparty.full_name}
        </div>
        {counterparty.is_online && (
          <div className="flex items-center gap-1 text-xs text-primary-600">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
            آنلاین
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50">
          <i className="fa-solid fa-phone" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50">
          <i className="fa-regular fa-circle-question" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50">
          <i className="fa-solid fa-ellipsis-vertical" />
        </button>
      </div>
    </div>
  );
}
