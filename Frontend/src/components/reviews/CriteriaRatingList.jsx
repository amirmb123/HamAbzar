import { REVIEW_CRITERIA } from "../../services/mockData";
import StarRatingInput from "./StarRatingInput";

export default function CriteriaRatingList({ values, onChange }) {
  return (
    <div className="mb-6 flex flex-col gap-4">
      {REVIEW_CRITERIA.map((criterion) => (
        <div key={criterion.key} className="flex items-center justify-between">
          <div>
            <div className="text-base font-medium text-gray-900">{criterion.label}</div>
            <div className="mt-0.5 text-xs text-gray-500">{criterion.desc}</div>
          </div>
          <StarRatingInput
            value={values[criterion.key] || 0}
            onChange={(v) => onChange(criterion.key, v)}
            size="mini"
          />
        </div>
      ))}
    </div>
  );
}
