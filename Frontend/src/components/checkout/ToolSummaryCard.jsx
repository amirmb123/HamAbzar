export default function ToolSummaryCard({ tool }) {
  return (
    <div className="mb-5 flex gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
        <i className="fa-solid fa-toolbox text-2xl" />
      </div>
      <div>
        <div className="mb-0.5 text-md font-semibold text-gray-900">{tool.name}</div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>
            <i className="fa-solid fa-location-dot" /> {tool.address}
          </span>
          <span>·</span>
          <span>
            <i className="fa-regular fa-user" /> {tool.owner.full_name}
          </span>
        </div>
      </div>
    </div>
  );
}
