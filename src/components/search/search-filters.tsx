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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  GENDERS,
  RELIGIONS,
  EDUCATION_LEVELS,
  PROFESSIONS,
  BANGLADESH_DIVISIONS,
  HEIGHTS,
  INCOME_RANGES,
  MOTHER_TONGUES,
} from "@/lib/utils";

export interface SearchFilters {
  gender: string;
  ageMin: string;
  ageMax: string;
  heightMin: string;
  heightMax: string;
  religion: string;
  education: string;
  profession: string;
  country: string;
  division: string;
  maritalStatus: string;
  incomeRange: string;
  motherTongue: string;
  isVerified: boolean;
  isPremium: boolean;
  hasPhoto: boolean;
  searchQuery: string;
}

const defaultFilters: SearchFilters = {
  gender: "",
  ageMin: "",
  ageMax: "",
  heightMin: "",
  heightMax: "",
  religion: "",
  education: "",
  profession: "",
  country: "",
  division: "",
  maritalStatus: "",
  incomeRange: "",
  motherTongue: "",
  isVerified: false,
  isPremium: false,
  hasPhoto: false,
  searchQuery: "",
};

interface SearchFiltersProps {
  onFilterChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  isLoading?: boolean;
  resultCount?: number;
}

export function SearchFiltersPanel({
  onFilterChange,
  onSearch,
  isLoading = false,
  resultCount,
}: SearchFiltersProps) {
  const [filters, setFilters] = React.useState<SearchFilters>(defaultFilters);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "searchQuery") return false;
    if (typeof value === "boolean") return value;
    return value !== "";
  }).length;

  const updateFilter = (key: keyof SearchFilters, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const selectClasses =
    "h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 appearance-none cursor-pointer";

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
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="rounded-full"
          >
            <SlidersHorizontal className="h-3 w-3 mr-1" />
            Advanced
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
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Religion */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-primary" />
                    Religion
                  </label>
                  <div className="relative">
                    <select
                      value={filters.religion}
                      onChange={(e) => updateFilter("religion", e.target.value)}
                      className={selectClasses}
                    >
                      <option value="">All Religions</option>
                      {RELIGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    Age
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      min={18}
                      max={70}
                      value={filters.ageMin}
                      onChange={(e) => updateFilter("ageMin", e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                    />
                    <span className="self-center text-muted-foreground">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      min={18}
                      max={70}
                      value={filters.ageMax}
                      onChange={(e) => updateFilter("ageMax", e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                    />
                  </div>
                </div>

                {/* Height */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Ruler className="h-3.5 w-3.5 text-primary" />
                    Height
                  </label>
                  <div className="relative">
                    <select
                      value={filters.heightMin}
                      onChange={(e) => updateFilter("heightMin", e.target.value)}
                      className={selectClasses}
                    >
                      <option value="">Min Height</option>
                      {HEIGHTS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-primary" />
                    Education
                  </label>
                  <div className="relative">
                    <select
                      value={filters.education}
                      onChange={(e) => updateFilter("education", e.target.value)}
                      className={selectClasses}
                    >
                      <option value="">All Education</option>
                      {EDUCATION_LEVELS.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Profession */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                    Profession
                  </label>
                  <div className="relative">
                    <select
                      value={filters.profession}
                      onChange={(e) => updateFilter("profession", e.target.value)}
                      className={selectClasses}
                    >
                      <option value="">All Professions</option>
                      {PROFESSIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Division */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Division
                  </label>
                  <div className="relative">
                    <select
                      value={filters.division}
                      onChange={(e) => updateFilter("division", e.target.value)}
                      className={selectClasses}
                    >
                      <option value="">All Divisions</option>
                      {BANGLADESH_DIVISIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Marital Status */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-primary" />
                    Marital Status
                  </label>
                  <div className="relative">
                    <select
                      value={filters.maritalStatus}
                      onChange={(e) => updateFilter("maritalStatus", e.target.value)}
                      className={selectClasses}
                    >
                      <option value="">Any Status</option>
                      <option value="Never Married">Never Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Awaiting Divorce">Awaiting Divorce</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Income */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    Income
                  </label>
                  <div className="relative">
                    <select
                      value={filters.incomeRange}
                      onChange={(e) => updateFilter("incomeRange", e.target.value)}
                      className={selectClasses}
                    >
                      <option value="">Any Income</option>
                      {INCOME_RANGES.map((i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Mother Tongue */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Languages className="h-3.5 w-3.5 text-primary" />
                    Mother Tongue
                  </label>
                  <div className="relative">
                    <select
                      value={filters.motherTongue}
                      onChange={(e) => updateFilter("motherTongue", e.target.value)}
                      className={selectClasses}
                    >
                      <option value="">Any Language</option>
                      {MOTHER_TONGUES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">Active:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(filters).map(([key, value]) => {
                      if (key === "searchQuery" || !value || value === false) return null;
                      const label = typeof value === "boolean" ? key : `${key}: ${value}`;
                      return (
                        <Badge
                          key={key}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-destructive/10"
                          onClick={() =>
                            updateFilter(
                              key as keyof SearchFilters,
                              typeof value === "boolean" ? false : ""
                            )
                          }
                        >
                          {label}
                          <X className="h-3 w-3 ml-1" />
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