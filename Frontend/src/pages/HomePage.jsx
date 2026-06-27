import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTools } from "../hooks/useTools";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { fetchCategories } from "../services/api";

import Header from "../components/layout/Header";
import FilterBar from "../components/layout/FilterBar";
import CategoryBar from "../components/layout/CategoryBar";
import ToolListPanel from "../components/tools/ToolListPanel";
import MapPanel from "../components/map/MapPanel";

export default function HomePage() {
  const navigate = useNavigate();
  const { tools, count, filters, status, updateFilter, resetFilters, refetch } = useTools();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 350);

  const [categories, setCategories] = useState([]);
  const [activeToggleFilters, setActiveToggleFilters] = useState({});
  const [hoveredToolId, setHoveredToolId] = useState(null);

  // بارگذاری دسته‌بندی‌ها یک‌بار در ابتدای صفحه
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // اعمال جستجوی دیبانس‌شده روی فیلتر اصلی
  useEffect(() => {
    updateFilter("search", debouncedSearch);
  }, [debouncedSearch, updateFilter]);

  const handleToggleChip = (key) => {
    setActiveToggleFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setActiveToggleFilters({});
    resetFilters();
  };

  const handleSelectTool = (tool) => {
    navigate(`/tools/${tool.id}`);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header searchValue={searchInput} onSearchChange={setSearchInput} />

      <FilterBar activeFilters={activeToggleFilters} onToggle={handleToggleChip} />

      <CategoryBar
        categories={categories}
        activeCategoryId={filters.category_id}
        onSelect={(id) => updateFilter("category_id", id)}
      />

      <div className="flex flex-1 overflow-hidden">
        <ToolListPanel
          tools={tools}
          count={count}
          status={status}
          ordering={filters.ordering}
          onOrderingChange={(value) => updateFilter("ordering", value)}
          hoveredToolId={hoveredToolId}
          onHoverTool={setHoveredToolId}
          onSelectTool={handleSelectTool}
          onResetFilters={handleResetFilters}
          onRetry={refetch}
        />

        <MapPanel
          tools={tools}
          hoveredToolId={hoveredToolId}
          onHoverTool={setHoveredToolId}
          onSelectTool={handleSelectTool}
        />
      </div>
    </div>
  );
}
