// src/components/map/MapPanel.jsx
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { createPriceIcon } from "./PriceMarkerIcon";
import { toPersianDigits, formatPrice } from "../../utils/format";

const DEFAULT_CENTER = [35.6892, 51.389]; // تهران

function FitToMarkers({ tools }) {
  const map = useMap();
  useMemo(() => {
    if (tools.length === 0) return;
    const bounds = tools.map((t) => [t.coordinates.lat, t.coordinates.lng]);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
  }, [tools, map]);
  return null;
}

/**
 * وقتی MapPanel از hidden به visible تغییر می‌کنه،
 * Leaflet باید ابعاد کانتینر رو دوباره حساب کنه.
 * بدون این، نقشه فقط یه گوشه لود می‌شه و بقیه سفیده.
 */
function MapResizeHandler({ visible }) {
  const map = useMap();
  useEffect(() => {
    if (visible) {
      // یه tick صبر می‌کنیم تا DOM آپدیت شه، بعد invalidate
      const t = setTimeout(() => map.invalidateSize(), 0);
      return () => clearTimeout(t);
    }
  }, [visible, map]);
  return null;
}

export default function MapPanel({ tools, hoveredToolId, onHoverTool, onSelectTool, visible, desktopVisible = true }) {
  // موبایل: visible کنترل میکنه | دسکتاپ: desktopVisible کنترل میکنه
  const mobileClass  = visible  ? "flex"   : "hidden";
  const desktopClass = desktopVisible ? "lg:flex" : "lg:hidden";

  return (
    <div
      className={`
        relative flex-1 overflow-hidden
        ${mobileClass} ${desktopClass}
      `}
    >
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* رفع باگ سفید موبایل — باید داخل MapContainer باشه */}
        <MapResizeHandler visible={visible} />

        <FitToMarkers tools={tools} />

        {tools.map((tool) => (
          <Marker
            key={tool.id}
            position={[tool.coordinates.lat, tool.coordinates.lng]}
            icon={createPriceIcon(tool.daily_price, hoveredToolId === tool.id)}
            eventHandlers={{
              mouseover: () => onHoverTool?.(tool.id),
              mouseout:  () => onHoverTool?.(null),
              click:     () => onSelectTool?.(tool),
            }}
          >
            <Popup>
              <div className="text-right" dir="rtl">
                <div className="mb-1 font-medium">{tool.name}</div>
                <div className="text-sm text-gray-600">{formatPrice(tool.daily_price)} / روز</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* نوار اطلاعات پایین نقشه */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-[20] flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 shadow-sm">
        <i className="fa-solid fa-location-dot text-primary-600" />
        <span>{toPersianDigits(tools.length)} ابزار در محدوده جاری</span>
      </div>
    </div>
  );
}