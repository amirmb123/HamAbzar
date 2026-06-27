import { Link } from "react-router-dom";

export default function DetailHeader({ categoryName, toolName }) {
  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-gray-200 bg-white px-6">
      <Link to="/" className="flex items-center gap-2 text-[15px] font-medium text-gray-900">
        <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-primary-600">
          <i className="fa-solid fa-screwdriver-wrench text-[13px] text-white" />
        </div>
        هم‌ابزار
      </Link>

      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Link to="/" className="hover:text-gray-900">
          خانه
        </Link>
        <i className="fa-solid fa-chevron-left text-[10px]" />
        <span>{categoryName}</span>
        <i className="fa-solid fa-chevron-left text-[10px]" />
        <span className="text-gray-900">{toolName}</span>
      </div>

      <Link
        to="/"
        className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        <i className="fa-solid fa-arrow-right" />
        بازگشت به لیست
      </Link>
    </header>
  );
}
