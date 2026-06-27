import { formatPrice } from "../../utils/format";

export const DELIVERY_METHODS = [
  {
    id: "in_person",
    icon: "fa-solid fa-handshake",
    title: "تحویل حضوری",
    desc: "دریافت از آدرس صاحب ابزار",
    price: 0,
  },
  {
    id: "courier",
    icon: "fa-solid fa-motorcycle",
    title: "پیک هم‌ابزار",
    desc: "تحویل درب منزل شما طی ۲ ساعت",
    price: 35000,
  },
];

export default function DeliveryOptions({ selectedMethod, onSelect, ownerAddress }) {
  return (
    <div className="flex flex-col gap-2">
      {DELIVERY_METHODS.map((method) => {
        const isSelected = selectedMethod === method.id;
        return (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`flex items-center gap-3 rounded-md border-[1.5px] p-4 text-right transition ${
              isSelected ? "border-primary-600 bg-primary-50" : "border-gray-200 hover:border-primary-100"
            }`}
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                isSelected ? "border-primary-600" : "border-gray-200"
              }`}
            >
              {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-primary-600" />}
            </div>

            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                isSelected ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-500"
              }`}
            >
              <i className={method.icon} />
            </div>

            <div className="flex-1">
              <div className="text-base font-medium text-gray-900">{method.title}</div>
              <div className="mt-0.5 text-xs text-gray-500">
                {method.id === "in_person" ? `${method.desc} در ${ownerAddress}` : method.desc}
              </div>
            </div>

            <div className="mr-auto whitespace-nowrap text-sm font-medium text-gray-900">
              {method.price === 0 ? "رایگان" : formatPrice(method.price)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
