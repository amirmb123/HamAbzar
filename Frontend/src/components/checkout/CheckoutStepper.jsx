const STEPS = [
  { id: 1, label: "انتخاب تاریخ" },
  { id: 2, label: "روش تحویل" },
  { id: 3, label: "پرداخت" },
  { id: 4, label: "تأیید نهایی" },
];

export default function CheckoutStepper({ currentStep }) {
  return (
    <div className="mx-auto flex max-w-[760px] items-center justify-center gap-0 border-b border-gray-200 bg-white px-6 py-4">
      {STEPS.map((step, idx) => {
        const isDone = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  isDone || isActive
                    ? `bg-primary-600 text-white ${isActive ? "shadow-[0_0_0_4px_rgba(232,245,239,1)]" : ""}`
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {isDone ? <i className="fa-solid fa-check" /> : step.id}
              </div>
              <span
                className={`text-sm ${isDone || isActive ? "font-medium text-gray-900" : "text-gray-400"}`}
              >
                {step.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div className={`mx-2 h-[1.5px] w-14 ${isDone ? "bg-primary-600" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
