import { Link } from "react-router-dom";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import { formatPriceShort } from "../../utils/format";
import { formatMessageTime } from "../../utils/chatTime";

function OfferCard({ offer }) {
  return (
    <div className="w-60 rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-500">
        <i className="fa-regular fa-calendar-check" />
        درخواست رزرو ارسال شد
      </div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-500">تاریخ:</span>
        <strong className="font-semibold text-gray-900">{offer.date_range_label}</strong>
      </div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-500">مبلغ کل:</span>
        <strong className="font-semibold text-gray-900">{formatPriceShort(offer.total_price)}</strong>
      </div>

      {offer.status === "pending" ? (
        <div className="mt-2 flex gap-2">
          <Button size="sm" className="flex-1">
            تأیید رزرو
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            رد کردن
          </Button>
        </div>
      ) : (
        <Link to={`/my-rentals`}>
          <Button variant="outline" size="sm" full className="mt-2">
            مشاهده رزرو
          </Button>
        </Link>
      )}
    </div>
  );
}

export default function MessageBubble({ message, isOutgoing, senderName }) {
  return (
    <div className={`flex max-w-[64%] gap-2 ${isOutgoing ? "self-end flex-row-reverse" : "self-start"}`}>
      {!isOutgoing && (
        <div className="mt-auto shrink-0">
          <Avatar name={senderName} size="sm" />
        </div>
      )}

      <div className="flex flex-col gap-1">
        {message.type === "text" && (
          <div
            className={`rounded-lg px-3.5 py-2.5 text-base leading-relaxed ${
              isOutgoing
                ? "rounded-bl-[4px] bg-primary-600 text-white"
                : "rounded-br-[4px] border border-gray-100 bg-white text-gray-900"
            }`}
          >
            {message.content}
          </div>
        )}

        {message.type === "image" && (
          <div className="flex h-[150px] w-[220px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gray-200">
            <img src={message.image_url} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        {message.type === "offer" && <OfferCard offer={message.offer} />}

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
