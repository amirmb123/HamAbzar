import { Link } from "react-router-dom";
import Button from "../common/Button";

export default function SuccessStep() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary-50 text-[32px] text-primary-600">
        <i className="fa-solid fa-check" />
      </div>
      <div className="mb-2 text-2xl font-bold text-gray-900">خوش آمدید!</div>
      <div className="mb-6 text-base leading-relaxed text-gray-500">ورود شما با موفقیت انجام شد</div>
      <Link to="/">
        <Button size="lg" full>
          رفتن به صفحه اصلی
        </Button>
      </Link>
    </div>
  );
}
