import { divIcon } from "leaflet";
import { formatPrice } from "../../utils/format";

/**
 * می‌سازه یک divIcon سفارشی برای Leaflet که شبیه pin-bubble طراحی اصلیه
 * (حباب سفید با متن قیمت + دم مثلثی رو به پایین).
 */
export function createPriceIcon(price, isActive) {
  const bg = isActive ? "#1A6B4A" : "#FFFFFF";
  const color = isActive ? "#FFFFFF" : "#111827";
  const border = isActive ? "#1A6B4A" : "#E5E7EB";

  const html = `
    <div style="
      display:flex; flex-direction:column; align-items:center;
      transform: translateY(-100%);
    ">
      <div style="
        background:${bg}; color:${color}; border:1px solid ${border};
        border-radius:9999px; padding:5px 10px; font-size:11px; font-weight:600;
        white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,.14);
        font-family:'Vazirmatn',sans-serif;
      ">${formatPrice(price)}</div>
      <div style="
        width:0; height:0; border-left:6px solid transparent;
        border-right:6px solid transparent; border-top:8px solid ${bg};
        margin:0 auto;
      "></div>
    </div>
  `;

  return divIcon({
    html,
    className: "",
    iconSize: [0, 0], // اندازه واقعی توسط محتوای داخلی تعیین می‌شه
  });
}
