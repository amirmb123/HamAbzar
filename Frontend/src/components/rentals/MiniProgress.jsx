export default function MiniProgress({ deliveredLabel, returnLabel }) {
  return (
    <div className="mt-2 flex items-center gap-1">
      <span className="ml-1.5 text-xs text-gray-500">{deliveredLabel}</span>
      <div className="h-[7px] w-[7px] rounded-full bg-primary-600" />
      <div className="h-0.5 max-w-[32px] flex-1 bg-primary-600" />
      <div className="h-[7px] w-[7px] rounded-full bg-primary-600" />
      <div className="h-0.5 max-w-[32px] flex-1 bg-gray-200" />
      <div className="h-[7px] w-[7px] rounded-full bg-gray-200" />
      <span className="mr-1.5 text-xs text-gray-500">{returnLabel}</span>
    </div>
  );
}
