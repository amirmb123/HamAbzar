export default function RentalRecap({ toolName, ownerName, dateRangeLabel }) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-600">
        <i className="fa-solid fa-toolbox text-xl" />
      </div>
      <div>
        <div className="text-md font-semibold text-gray-900">{toolName}</div>
        <div className="mt-0.5 text-xs text-gray-500">
          اجاره از {ownerName} · {dateRangeLabel}
        </div>
      </div>
    </div>
  );
}
