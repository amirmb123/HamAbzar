const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-[60px] w-[60px] text-xl",
};

function getInitials(fullName = "") {
  const parts = fullName.trim().split(" ");
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : fullName.slice(0, 2);
}

/** آواتار مشترک — معادل .avatar / .avatar-sm / .avatar-md / .avatar-lg در shared.css */
export default function Avatar({ name, src, size = "md" }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 font-semibold text-primary-600 ${SIZE_CLASSES[size]}`}
    >
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : getInitials(name)}
    </div>
  );
}
