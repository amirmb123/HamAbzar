// src/pages/HomePage.jsx
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

  const [searchInput, setSearchInput]           = useState("");
  const debouncedSearch                          = useDebouncedValue(searchInput, 350);
  const [categories, setCategories]             = useState([]);
  const [activeToggleFilters, setActiveToggleFilters] = useState({});
  const [hoveredToolId, setHoveredToolId]       = useState(null);

  // موبایل: 'list' | 'map'
  const [mobileView, setMobileView] = useState("list");

  // دسکتاپ: آیا نقشه نمایش داده شود؟
  const [desktopMapVisible, setDesktopMapVisible] = useState(true);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

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

  const toggleMobileView = () => {
    setMobileView((v) => (v === "list" ? "map" : "list"));
  };

  const showingMap  = mobileView === "map";
  const showingList = mobileView === "list";

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header searchValue={searchInput} onSearchChange={setSearchInput} />
      <FilterBar activeFilters={activeToggleFilters} onToggle={handleToggleChip} />
      <CategoryBar
        categories={categories}
        activeCategoryId={filters.category_id}
        onSelect={(id) => updateFilter("category_id", id)}
      />

      {/* بدنه اصلی */}
      <div className="relative flex flex-1 overflow-hidden">

        {/* لیست ابزارها */}
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
          visible={showingList}
          // دکمه toggle نقشه روی دسکتاپ
          desktopMapVisible={desktopMapVisible}
          onToggleDesktopMap={() => setDesktopMapVisible((v) => !v)}
        />

        {/* نقشه */}
        <MapPanel
          tools={tools}
          hoveredToolId={hoveredToolId}
          onHoverTool={setHoveredToolId}
          onSelectTool={handleSelectTool}
          visible={showingMap}
          desktopVisible={desktopMapVisible}
        />

        {/* دکمه شناور toggle — فقط موبایل */}
        <button
          onClick={toggleMobileView}
          className="
            lg:hidden
            fixed bottom-6 left-1/2 -translate-x-1/2 z-[500]
            flex items-center gap-2
            rounded-full bg-gray-900 px-5 py-3
            text-sm font-semibold text-white shadow-lg
            active:scale-95 transition-transform
          "
        >
          {showingMap ? (
            <>
              <i className="fa-solid fa-list" />
              نمایش لیست
            </>
          ) : (
            <>
              <i className="fa-solid fa-map" />
              نمایش نقشه
            </>
          )}
        </button>

      </div>
    </div>
  );
}