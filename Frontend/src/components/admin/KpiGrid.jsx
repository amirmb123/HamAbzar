import KpiCard from "./KpiCard";

export default function KpiGrid({ kpis }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard
        icon="fa-solid fa-toolbox"
        iconClassName="bg-primary-50 text-primary-600"
        value={kpis.active_tools.value}
        label="ابزار فعال"
        trendPercent={kpis.active_tools.trend_percent}
        trendDirection={kpis.active_tools.trend_direction}
      />
      <KpiCard
        icon="fa-regular fa-user"
        iconClassName="bg-info-50 text-info-600"
        value={kpis.active_users.value}
        label="کاربر فعال"
        trendPercent={kpis.active_users.trend_percent}
        trendDirection={kpis.active_users.trend_direction}
      />
      <KpiCard
        icon="fa-regular fa-calendar-check"
        iconClassName="bg-warning-50 text-warning-600"
        value={kpis.monthly_rentals.value}
        label="رزرو این ماه"
        trendPercent={kpis.monthly_rentals.trend_percent}
        trendDirection={kpis.monthly_rentals.trend_direction}
      />
      <KpiCard
        icon="fa-solid fa-flag"
        iconClassName="bg-[#FDE8E8] text-[#B91C1C]"
        value={kpis.open_reports.value}
        label="گزارش تخلف باز"
        trendPercent={kpis.open_reports.trend_percent}
        trendDirection={kpis.open_reports.trend_direction}
      />
    </div>
  );
}
