import { toPersianDigits } from "../../utils/format";

const MAX_LENGTH = 500;

export default function CommentTextarea({ value, onChange }) {
  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-medium text-gray-900">نظر شما</label>
      <textarea
        rows={4}
        maxLength={MAX_LENGTH}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="تجربه خود را با جزئیات بنویسید..."
        className="w-full resize-y rounded-md border border-gray-200 px-3.5 py-2.5 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary-600 focus:shadow-[0_0_0_3px_rgba(26,107,74,.1)]"
      />
      <div className="mt-1 text-left text-xs text-gray-400">
        {toPersianDigits(value.length)} / {toPersianDigits(MAX_LENGTH)} کاراکتر
      </div>
    </div>
  );
}
