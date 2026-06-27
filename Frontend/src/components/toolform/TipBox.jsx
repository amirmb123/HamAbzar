export default function TipBox({ children }) {
  return (
    <div className="mt-2 flex gap-3 rounded-md bg-info-50 p-4">
      <i className="fa-solid fa-lightbulb mt-0.5 text-base text-info-600" />
      <p className="text-sm leading-relaxed text-gray-700">{children}</p>
    </div>
  );
}
