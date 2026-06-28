import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { createLocationPinIcon } from "../map/LocationPinIcon";
import { toPersianDigits } from "../../utils/format";

const DEFAULT_CENTER = [35.6892, 51.389]; // تهران — مرکز پیش‌فرض نقشه تا کاربر موقعیت را انتخاب کند

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * انتخاب موقعیت دقیق ابزار روی نقشه.
 * latitude/longitude در بک‌اند الزامی هستند (Tool.latitude / Tool.longitude)
 * پس این کامپوننت همیشه یک نشانگر فعال دارد (با مقدار پیش‌فرض تهران).
 */
export default function LocationPicker({ latitude, longitude, onChange }) {
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");

  const position =
    latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined
      ? [Number(latitude), Number(longitude)]
      : DEFAULT_CENTER;

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setLocateError("مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند.");
      return;
    }
    setLocating(true);
    setLocateError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setLocateError("دسترسی به موقعیت ممکن نشد. روی نقشه کلیک کنید.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div>
      <div className="relative h-[260px] w-full overflow-hidden rounded-lg border border-gray-200">
        <MapContainer center={position} zoom={13} className="h-full w-full" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={onChange} />
          <Marker
            position={position}
            icon={createLocationPinIcon()}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                onChange(lat, lng);
              },
            }}
          />
        </MapContainer>

        <button
          type="button"
          onClick={handleLocate}
          className="absolute right-3 top-3 z-[20] flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <i className={`fa-solid fa-location-crosshairs ${locating ? "animate-spin" : ""}`} />
          موقعیت من
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        روی نقشه کلیک کنید یا نشانگر را بکشید تا موقعیت دقیق ابزار مشخص شود — مختصات: {toPersianDigits(position[0].toFixed(5))}،{" "}
        {toPersianDigits(position[1].toFixed(5))}
      </div>
      {locateError && <div className="mt-1 text-xs text-danger-600">{locateError}</div>}
    </div>
  );
}
