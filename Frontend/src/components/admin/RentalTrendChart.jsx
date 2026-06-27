export default function RentalTrendChart({ data }) {
  const peakIndex = data.reduce((maxIdx, item, idx, arr) => (item.height_percent > arr[maxIdx].height_percent ? idx : maxIdx), 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between text-md font-semibold text-gray-900">
        روند رزروها (۷ روز اخیر)
        <a href="#" className="text-xs font-normal text-primary-600">
          گزارش کامل
        </a>
      </div>

      <div className="flex h-40 items-end gap-2 pt-4">
        {data.map((item, idx) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={`w-full rounded-t-[4px] ${idx === peakIndex ? "bg-primary-600" : "bg-primary-100"}`}
              style={{ height: `${item.height_percent}%` }}
            />
            <span className="text-[10px] text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
