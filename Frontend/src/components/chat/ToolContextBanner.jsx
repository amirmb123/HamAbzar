import { Link } from "react-router-dom";
import Button from "../common/Button";
import { formatPriceShort } from "../../utils/format";

export default function ToolContextBanner({ rentalContext }) {
  if (!rentalContext) return null;
  const { tool, booking_code, date_range_label, rental_id } = rentalContext;

  return (
    <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-5 py-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-600">
        <i className="fa-solid fa-toolbox" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-gray-900">{tool.name}</div>
        <div className="text-xs text-gray-500">
          رزرو #{booking_code} · {date_range_label}
        </div>
      </div>
      <div className="text-sm font-semibold text-primary-600">{formatPriceShort(tool.daily_price)}/روز</div>
      <Link to={`/my-rentals`}>
        <Button variant="outline" size="sm">
          مشاهده رزرو
        </Button>
      </Link>
    </div>
  );
}
