"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  RotateCcw,
  MapPin,
  GraduationCap,
  Briefcase,
  Heart,
  Users,
  Ruler,
  Globe,
  Languages,
  Home,
  Utensils,
  Cigarette,
  Wine,
  Droplets,
  UserCheck,
  Camera,
  Zap,
  Building,
  DollarSign,
  Bookmark,
  Calendar,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  GENDERS,
  RELIGIONS,
  EDUCATION_LEVELS,
  PROFESSIONS,
  BANGLADESH_DIVISIONS,
  HEIGHTS,
  INCOME_RANGES,
  MOTHER_TONGUES,
  MARITAL_STATUSES,
  FAMILY_TYPES,
  FAMILY_STATUSES,
  FAMILY_VALUES,
  DIETS,
  SMOKE_OPTIONS,
  DRINK_OPTIONS,
  BLOOD_GROUPS,
  PROFILE_CREATED_BY_OPTIONS,
  WORKING_WITH_OPTIONS,
  HOBBIES,
  NATIONALITIES,
  SORT_OPTIONS,
  ACTIVE_WITHIN_OPTIONS,
} from "@/lib/utils";

export interface SearchFilters {
  // Text search
  searchQuery: string;
  // 1-2. Gender
  gender: string;
  // 3-4. Age range
  ageMin: string;
  ageMax: string;
  // 5-6. Height range
  heightMin: string;
  heightMax: string;
  // 7. Religion
  religion: string;
  // 8. Mother tongue
  motherTongue: string;
  // 9. Marital status
  maritalStatus: string;
  // 10. Education
  education: string;
  // 11. Institution
  institution: string;
  // 12. Profession
  profession: string;
  // 13. Working with
  workingWith: string;
  // 14. Income
  incomeRange: string;
  // 15. Country
  country: string;
  // 16. Division
  division: string;
  // 17. Nationality
  nationality: string;
  // 18. Family type
  familyType: string;
  // 19. Family status
  familyStatus: string;
  // 20. Family values
  familyValues: string;
  // 21. Diet
  diet: string;
  // 22. Smoke
  smoke: string;
  // 23. Drink
  drink: string;
  // 24. Blood group
  bloodGroup: string;
  // 25. Profile created by
  profileCreatedBy: string;
  // 26. Has photo
  hasPhoto: boolean;
  // 27. Verified
  isVerified: boolean;
  // 28. Premium
  isPremium: boolean;
  // 29. Hobbies
  hobbies: string[];
  // 30. Active within
  activeWithinDays: string;
  // 31. Sort
  sortBy: string;
  // 32. Caste
  caste: string;
}

const defaultFilters: SearchFilters = {
  searchQuery: "",
  gender: "",
  ageMin: "",
  ageMax: "",
  heightMin: "",
  heightMax: "",
  religion: "",
  motherTongue: "",
  maritalStatus: "",
  education: "",
  institution: "",
  profession: "",
  workingWith: "",
  incomeRange: "",
  country: "",
  division: "",
  nationality: "",
  familyType: "",
  familyStatus: "",
  familyValues: "",
  diet: "",
  smoke: "",
  drink: "",
  bloodGroup: "",
  profileCreatedBy: "",
  hasPhoto: false,
  isVerified: false,
  isPremium: false,
  hobbies: [],
  activeWithinDays: "",
  sortBy: "relevance",
  caste: "",
};

interface SearchFiltersProps {
  onFilterChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  isLoading?: boolean;
  resultCount?: number;
  initialFilters?: Partial<SearchFilters>;
  onSaveSearch?: () => void;
  savedSearchCount?: number;
}

export function SearchFiltersPanel({
  onFilterChange,
  onSearch,
  isLoading = false,
  resultCount,
  initialFilters,
  onSaveSearch,
  savedSearchCount,
}: SearchFiltersProps) {
  const [filters, setFilters] = React.useState<SearchFilters>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string>("basic");

  React.useEffect(() => {
    if (initialFilters) {
      setFilters((prev) => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (["searchQuery", "sortBy"].includes(key)) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "boolean") return value;
    return value !== "";
  }).length;

  const updateFilter = (key: keyof SearchFilters, value: string | boolean | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const toggleHobby = (hobby: string) => {
    const current = filters.hobbies;
    const newHobbies = current.includes(hobby)
      ? current.filter((h) => h !== hobby)
      : [...current, hobby];
    updateFilter("hobbies", newHobbies);
  };

  const selectClasses =
    "h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 appearance-none cursor-pointer";

  const filterSections = [
    { id: "basic", label: "Basic", icon: Users },
    { id: "location", label: "Location", icon: MapPin },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "family", label: "Family", icon: Home },
    { id: "lifestyle", label: "Lifestyle", icon: Utensils },
    { id: "other", label: "Other", icon: Star },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, profession, or location..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter("searchQuery", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 h-5 min-w-5 text-[10px] px-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <Button variant="gradient" onClick={onSearch} isLoading={isLoading}>
              Search
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            variant={filters.gender === "Female" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("gender", filters.gender === "Female" ? "" : "Female")}
            className="rounded-full"
          >
            <Heart className="h-3 w-3 mr-1" />
            Female
          </Button>
          <Button
            variant={filters.gender === "Male" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("gender", filters.gender === "Male" ? "" : "Male")}
            className="rounded-full"
          >
            <Users className="h-3 w-3 mr-1" />
            Male
          </Button>
          <Button
            variant={filters.isVerified ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("isVerified", !filters.isVerified)}
            className="rounded-full"
          >
            ✓ Verified
          </Button>
          <Button
            variant={filters.hasPhoto ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("hasPhoto", !filters.hasPhoto)}
            className="rounded-full"
          >
            📷 With Photo
          </Button>
          <Button
            variant={filters.isPremium ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("isPremium", !filters.isPremium)}
            className="rounded-full"
          >
            <Star className="h-3 w-3 mr-1" />
            Premium
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="rounded-full"
          >
            <SlidersHorizontal className="h-3 w-3 mr-1" />
            All Filters ({activeFilterCount})
            {showAdvanced ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {(showAdvanced || mobileOpen) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Advanced Filters</h3>
                <div className="flex items-center gap-2">
                  {onSaveSearch && (
                    <Button variant="outline" size="sm" onClick={onSaveSearch}>
                      <Bookmark className="h-4 w-4 mr-1" />
                      Save Search
                      {savedSearchCount !== undefined && (
                        <span className="ml-1 text-xs text-muted-foreground">({savedSearchCount})</span>
                      )}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset All
                  </Button>
                </div>
              </div>

              {/* Section Tabs */}
              <div className="flex flex-wrap gap-1 mb-4 p-1 bg-muted rounded-lg">
                {filterSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        activeSection === section.id
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{section.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Basic Section */}
              {activeSection === "basic" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-primary" />
                      Religion
                    </label>
                    <div className="relative">
                      <select value={filters.religion} onChange={(e) => updateFilter("religion", e.target.value)} className={selectClasses}>
                        <option value="">All Religions</option>
                        {RELIGIONS.map((r) => (<option key={r} value={r}>{r}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      Age Range
                    </label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Min" min={18} max={70} value={filters.ageMin}
                        onChange={(e) => updateFilter("ageMin", e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      <span className="self-center text-muted-foreground">-</span>
                      <input type="number" placeholder="Max" min={18} max={70} value={filters.ageMax}
                        onChange={(e) => updateFilter("ageMax", e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Ruler className="h-3.5 w-3.5 text-primary" />
                      Min Height
                    </label>
                    <div className="relative">
                      <select value={filters.heightMin} onChange={(e) => updateFilter("heightMin", e.target.value)} className={selectClasses}>
                        <option value="">Min Height</option>
                        {HEIGHTS.map((h) => (<option key={h} value={h}>{h}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Ruler className="h-3.5 w-3.5 text-primary" />
                      Max Height
                    </label>
                    <div className="relative">
                      <select value={filters.heightMax} onChange={(e) => updateFilter("heightMax", e.target.value)} className={selectClasses}>
                        <option value="">Max Height</option>
                        {HEIGHTS.map((h) => (<option key={h} value={h}>{h}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Languages className="h-3.5 w-3.5 text-primary" />
                      Mother Tongue
                    </label>
                    <div className="relative">
                      <select value={filters.motherTongue} onChange={(e) => updateFilter("motherTongue", e.target.value)} className={selectClasses}>
                        <option value="">Any Language</option>
                        {MOTHER_TONGUES.map((l) => (<option key={l} value={l}>{l}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-primary" />
                      Marital Status
                    </label>
                    <div className="relative">
                      <select value={filters.maritalStatus} onChange={(e) => updateFilter("maritalStatus", e.target.value)} className={selectClasses}>
                        <option value="">Any Status</option>
                        {MARITAL_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Droplets className="h-3.5 w-3.5 text-primary" />
                      Blood Group
                    </label>
                    <div className="relative">
                      <select value={filters.bloodGroup} onChange={(e) => updateFilter("bloodGroup", e.target.value)} className={selectClasses}>
                        <option value="">Any Blood Group</option>
                        {BLOOD_GROUPS.map((b) => (<option key={b} value={b}>{b}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-primary" />
                      Profile Created By
                    </label>
                    <div className="relative">
                      <select value={filters.profileCreatedBy} onChange={(e) => updateFilter("profileCreatedBy", e.target.value)} className={selectClasses}>
                        <option value="">Any</option>
                        {PROFILE_CREATED_BY_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                      Caste
                    </label>
                    <input
                      type="text"
                      placeholder="Enter caste"
                      value={filters.caste}
                      onChange={(e) => updateFilter("caste", e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              )}

              {/* Location Section */}
              {activeSection === "location" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      Country
                    </label>
                    <input
                      type="text"
                      placeholder="Country"
                      value={filters.country}
                      onChange={(e) => updateFilter("country", e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      Division
                    </label>
                    <div className="relative">
                      <select value={filters.division} onChange={(e) => updateFilter("division", e.target.value)} className={selectClasses}>
                        <option value="">All Divisions</option>
                        {BANGLADESH_DIVISIONS.map((d) => (<option key={d} value={d}>{d}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      Nationality
                    </label>
                    <div className="relative">
                      <select value={filters.nationality} onChange={(e) => updateFilter("nationality", e.target.value)} className={selectClasses}>
                        <option value="">Any Nationality</option>
                        {NATIONALITIES.map((n) => (<option key={n} value={n}>{n}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      Active Within
                    </label>
                    <div className="relative">
                      <select value={filters.activeWithinDays} onChange={(e) => updateFilter("activeWithinDays", e.target.value)} className={selectClasses}>
                        <option value="">Any Time</option>
                        {ACTIVE_WITHIN_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Education Section */}
              {activeSection === "education" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-primary" />
                      Education
                    </label>
                    <div className="relative">
                      <select value={filters.education} onChange={(e) => updateFilter("education", e.target.value)} className={selectClasses}>
                        <option value="">All Education</option>
                        {EDUCATION_LEVELS.map((e) => (<option key={e} value={e}>{e}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-primary" />
                      Institution
                    </label>
                    <input
                      type="text"
                      placeholder="Institution name"
                      value={filters.institution}
                      onChange={(e) => updateFilter("institution", e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-primary" />
                      Profession
                    </label>
                    <div className="relative">
                      <select value={filters.profession} onChange={(e) => updateFilter("profession", e.target.value)} className={selectClasses}>
                        <option value="">All Professions</option>
                        {PROFESSIONS.map((p) => (<option key={p} value={p}>{p}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-primary" />
                      Working With
                    </label>
                    <div className="relative">
                      <select value={filters.workingWith} onChange={(e) => updateFilter("workingWith", e.target.value)} className={selectClasses}>
                        <option value="">Any</option>
                        {WORKING_WITH_OPTIONS.map((w) => (<option key={w} value={w}>{w}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-primary" />
                      Annual Income
                    </label>
                    <div className="relative">
                      <select value={filters.incomeRange} onChange={(e) => updateFilter("incomeRange", e.target.value)} className={selectClasses}>
                        <option value="">Any Income</option>
                        {INCOME_RANGES.map((i) => (<option key={i} value={i}>{i}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Family Section */}
              {activeSection === "family" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Home className="h-3.5 w-3.5 text-primary" />
                      Family Type
                    </label>
                    <div className="relative">
                      <select value={filters.familyType} onChange={(e) => updateFilter("familyType", e.target.value)} className={selectClasses}>
                        <option value="">Any</option>
                        {FAMILY_TYPES.map((f) => (<option key={f} value={f}>{f}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Home className="h-3.5 w-3.5 text-primary" />
                      Family Status
                    </label>
                    <div className="relative">
                      <select value={filters.familyStatus} onChange={(e) => updateFilter("familyStatus", e.target.value)} className={selectClasses}>
                        <option value="">Any</option>
                        {FAMILY_STATUSES.map((f) => (<option key={f} value={f}>{f}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Home className="h-3.5 w-3.5 text-primary" />
                      Family Values
                    </label>
                    <div className="relative">
                      <select value={filters.familyValues} onChange={(e) => updateFilter("familyValues", e.target.value)} className={selectClasses}>
                        <option value="">Any</option>
                        {FAMILY_VALUES.map((f) => (<option key={f} value={f}>{f}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Lifestyle Section */}
              {activeSection === "lifestyle" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-1.5">
                        <Utensils className="h-3.5 w-3.5 text-primary" />
                        Diet
                      </label>
                      <div className="relative">
                        <select value={filters.diet} onChange={(e) => updateFilter("diet", e.target.value)} className={selectClasses}>
                          <option value="">Any</option>
                          {DIETS.map((d) => (<option key={d} value={d}>{d}</option>))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-1.5">
                        <Cigarette className="h-3.5 w-3.5 text-primary" />
                        Smoking
                      </label>
                      <div className="relative">
                        <select value={filters.smoke} onChange={(e) => updateFilter("smoke", e.target.value)} className={selectClasses}>
                          <option value="">Any</option>
                          {SMOKE_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-1.5">
                        <Wine className="h-3.5 w-3.5 text-primary" />
                        Drinking
                      </label>
                      <div className="relative">
                        <select value={filters.drink} onChange={(e) => updateFilter("drink", e.target.value)} className={selectClasses}>
                          <option value="">Any</option>
                          {DRINK_OPTIONS.map((d) => (<option key={d} value={d}>{d}</option>))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Hobbies */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-primary" />
                      Hobbies {filters.hobbies.length > 0 && <span className="text-xs text-muted-foreground">({filters.hobbies.length} selected)</span>}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {HOBBIES.map((hobby) => (
                        <Button
                          key={hobby}
                          variant={filters.hobbies.includes(hobby) ? "default" : "outline"}
                          size="sm"
                          className="rounded-full text-xs"
                          onClick={() => toggleHobby(hobby)}
                        >
                          {hobby}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Other Section */}
              {activeSection === "other" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                      Sort By
                    </label>
                    <div className="relative">
                      <select value={filters.sortBy} onChange={(e) => updateFilter("sortBy", e.target.value)} className={selectClasses}>
                        {SORT_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">Active:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(filters).map(([key, value]) => {
                      if (["searchQuery", "sortBy"].includes(key)) return null;
                      if (Array.isArray(value)) {
                        return value.map((v) => (
                          <Badge key={`${key}-${v}`} variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/10"
                            onClick={() => updateFilter(key as keyof SearchFilters, value.filter((x) => x !== v))}>
                            {v} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ));
                      }
                      if (typeof value === "boolean") {
                        if (!value) return null;
                        return (
                          <Badge key={key} variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/10"
                            onClick={() => updateFilter(key as keyof SearchFilters, false)}>
                            {key} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        );
                      }
                      if (!value) return null;
                      return (
                        <Badge key={key} variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/10"
                          onClick={() => updateFilter(key as keyof SearchFilters, "")}>
                          {String(value)} <X className="h-3 w-3 ml-1" />
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Result Count */}
              {resultCount !== undefined && (
                <p className="text-sm text-muted-foreground mt-3">
                  Found <span className="font-semibold text-foreground">{resultCount}</span> profiles
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}