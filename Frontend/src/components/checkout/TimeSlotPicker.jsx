export const TIME_SLOTS = [
  { id: "morning", time: "۹:۰۰ - ۱۲:۰۰", label: "صبح" },
  { id: "noon", time: "۱۲:۰۰ - ۱۶:۰۰", label: "ظهر" },
  { id: "evening", time: "۱۶:۰۰ - ۲۰:۰۰", label: "عصر" },
];

export default function TimeSlotPicker({ selectedSlot, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {TIME_SLOTS.map((slot) => (
        <button
          key={slot.id}
          onClick={() => onSelect(slot.id)}
          className={`rounded-md border-[1.5px] p-3 text-center transition ${
            selectedSlot === slot.id
              ? "border-primary-600 bg-primary-50"
              : "border-gray-200 hover:border-primary-100"
          }`}
        >
          <div className="text-base font-semibold text-gray-900">{slot.time}</div>
          <div className="mt-0.5 text-xs text-gray-500">{slot.label}</div>
        </button>
      ))}
    </div>
  );
}
