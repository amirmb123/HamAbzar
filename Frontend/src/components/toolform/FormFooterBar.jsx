import { toPersianDigits } from "../../utils/format";
import Button from "../common/Button";

export default function FormFooterBar({ currentStep, totalSteps, onPrev, onNext, isSubmitting, isNextDisabled }) {
  return (
    <div className="sticky bottom-0 mt-8 flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
      <span className="text-sm text-gray-500">
        مرحله {toPersianDigits(currentStep)} از {toPersianDigits(totalSteps)}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onPrev} disabled={currentStep === 1}>
          <i className="fa-solid fa-arrow-right" />
          مرحله قبل
        </Button>
        <Button onClick={onNext} disabled={isSubmitting || isNextDisabled}>
          {isSubmitting ? "در حال ذخیره..." : currentStep === totalSteps ? "انتشار آگهی" : "مرحله بعد"}
          {!isSubmitting && <i className="fa-solid fa-arrow-left" />}
        </Button>
      </div>
    </div>
  );
}
