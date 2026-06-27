import { Link } from "react-router-dom";
import Avatar from "../common/Avatar";

const NAV_ITEMS = [
  { label: "کاوش", path: "/" },
  { label: "ابزارهای من", path: "/my-tools" },
  { label: "کرایه‌هایم", path: "/my-rentals" },
];

export default function AppHeader({ activePath, userName = "علی رضایی" }) {
  return (
    <header className="flex h-16 items-center gap-6 border-b border-gray-200 bg-white px-6">
      <Link to="/" className="flex items-center gap-2 text-base font-semibold text-gray-900">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-md bg-primary-600 text-white">
          <i className="fa-solid fa-screwdriver-wrench" />
        </div>
        هم‌ابزار
      </Link>

      <nav className="mr-auto hidden items-center gap-1 md:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`rounded-md px-3 py-2 text-base transition ${
              activePath === item.path
                ? "bg-primary-50 font-medium text-primary-600"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Avatar name={userName} size="sm" />
    </header>
  );
}
