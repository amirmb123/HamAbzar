import { divIcon } from "leaflet";

/**
 * می‌سازه یک divIcon سفارشی برای نشانگر انتخاب موقعیت (پین سبز).
 * هم‌خانواده با createPriceIcon در PriceMarkerIcon.js — همون الگوی
 * استفاده از FontAwesome به‌جای تصویر مارکر پیش‌فرض Leaflet.
 */
export function createLocationPinIcon() {
  const html = `
    <div style="transform: translateY(-100%);">
      <i
        class="fa-solid fa-location-dot"
        style="
          font-size: 34px;
          color: #1A6B4A;
          filter: drop-shadow(0 2px 3px rgba(0,0,0,.35));
        "
      ></i>
    </div>
  `;

  return divIcon({
    html,
    className: "",
    iconSize: [0, 0], // اندازه واقعی توسط محتوای داخلی تعیین می‌شه
  });
}
