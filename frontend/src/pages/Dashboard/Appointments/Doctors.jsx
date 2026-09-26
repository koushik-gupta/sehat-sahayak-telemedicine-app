import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DoctorCard from "../../../components/DoctorCard";
import {
  ArrowLeft,
  BriefcaseMedical,
  Filter,
  Search,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import { getGlassCardClass, getGlassPanelClass, useDashboardTheme } from "../DashboardThemeContext";

const defaultFilters = {
  category: "All",
  sortBy: "recommended",
  minRating: "all",
  experience: "all",
  price: "all",
  availability: "all",
};

export default function Doctors({ doctors, onSelectDoctor, onBack, t, initialSearchQuery }) {
  const { isDark } = useDashboardTheme();
  const glassPanelClass = getGlassPanelClass(isDark);
  const glassCardClass = getGlassCardClass(isDark);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "");
  const [filters, setFilters] = useState(defaultFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const categories = useMemo(
    () => ["All", ...new Set(doctors.map((doc) => doc.specialty).filter(Boolean))],
    [doctors]
  );

  const filteredDoctors = useMemo(() => {
    let nextDoctors = doctors.filter((doctor) => {
      const specialty = doctor.specialty || "";
      const search = searchQuery.trim().toLowerCase();
      const experience = numericExperience(doctor.experience);
      const fee = numericFee(doctor.fee);
      const rating = numericRating(doctor.rating);
      const hasVisibleSlot = Array.isArray(doctor.slots) && doctor.slots.length > 0;

      const matchesCategory = filters.category === "All" || specialty === filters.category;
      const matchesSearch =
        !search ||
        doctor.name?.toLowerCase().includes(search) ||
        specialty.toLowerCase().includes(search) ||
        doctor.hospital?.toLowerCase().includes(search);
      const matchesRating =
        filters.minRating === "all" || rating >= Number(filters.minRating);
      const matchesExperience =
        filters.experience === "all" || experience >= Number(filters.experience);
      const matchesPrice =
        filters.price === "all" ||
        (filters.price === "500" ? fee > 0 && fee <= 500 : fee > 0 && fee <= 800);
      const matchesAvailability =
        filters.availability === "all" ||
        (filters.availability === "queue" ? true : hasVisibleSlot);

      return (
        matchesCategory &&
        matchesSearch &&
        matchesRating &&
        matchesExperience &&
        matchesPrice &&
        matchesAvailability
      );
    });

    nextDoctors = [...nextDoctors].sort((a, b) => {
      if (filters.sortBy === "fee_low") {
        return numericFee(a.fee) - numericFee(b.fee);
      }

      if (filters.sortBy === "experience") {
        return numericExperience(b.experience) - numericExperience(a.experience);
      }

      if (filters.sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      const ratingDiff = numericRating(b.rating) - numericRating(a.rating);
      if (ratingDiff !== 0) {
        return ratingDiff;
      }

      return numericExperience(b.experience) - numericExperience(a.experience);
    });

    return nextDoctors;
  }, [doctors, filters, searchQuery]);

  const activeFilterChips = useMemo(() => {
    const chips = [];

    if (filters.category !== "All") {
      chips.push(filters.category);
    }
    if (filters.minRating !== "all") {
      chips.push(`${filters.minRating}+ rating`);
    }
    if (filters.experience !== "all") {
      chips.push(`${filters.experience}+ years`);
    }
    if (filters.price === "500") {
      chips.push("Under Rs. 500");
    }
    if (filters.price === "800") {
      chips.push("Under Rs. 800");
    }
    if (filters.availability === "queue") {
      chips.push("Instant queue");
    }
    if (filters.availability === "slots") {
      chips.push("Visible slots");
    }

    return chips;
  }, [filters]);

  const specialistCount = categories.length - 1;
  const featuredSpecialties = categories.filter((category) => category !== "All").slice(0, 5);
  const doctorCountLabel = `${filteredDoctors.length} ${filteredDoctors.length === 1 ? "doctor" : "doctors"} shown`;

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setSearchQuery(initialSearchQuery || "");
  };

  return (
    <div className="space-y-6">
      <section className={`relative overflow-hidden rounded-[30px] ${glassPanelClass}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.10),_transparent_30%)]" />
        <div className="absolute -left-10 top-6 h-24 w-24 rounded-full bg-blue-100/80 blur-3xl" />
        <div className="absolute right-0 top-0 h-28 w-28 translate-x-1/4 -translate-y-1/4 rounded-full bg-indigo-100/80 blur-3xl" />

        <div className="relative grid gap-5 px-5 py-5 md:px-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.85fr)] lg:items-center">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {onBack && (
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={onBack}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm backdrop-blur transition-all ${
                    isDark
                      ? "border-white/10 bg-white/8 text-slate-200 hover:border-cyan-300/20 hover:text-white"
                      : "border-slate-200 bg-white/90 text-slate-700 hover:border-blue-200 hover:text-blue-700"
                  }`}
                >
                  <ArrowLeft size={15} />
                  Back
                </motion.button>
              )}

              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] shadow-sm backdrop-blur ${
                isDark ? "border-white/10 bg-white/8 text-slate-300" : "border-white/80 bg-white/75 text-slate-600"
              }`}>
                <Sparkles size={14} className="text-blue-600" />
                Curated for patients
              </span>
            </div>

            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${isDark ? "bg-blue-500/15 text-blue-200" : "bg-blue-50 text-blue-700"}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {t.availableDoctors || "Available Doctors"}
              </div>

              <div>
                <h1 className={`max-w-xl text-2xl font-bold tracking-tight md:text-[2rem] ${isDark ? "text-slate-50" : "text-slate-900"}`}>
                  Modern doctor discovery, kept light and fast.
                </h1>
                <p className={`mt-2 max-w-xl text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Browse verified specialists, compare options quickly, and book without leaving the dashboard.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <MiniStat label="Visible now" value={doctorCountLabel} />
              <MiniStat
                label="Search scope"
                value={searchQuery ? `Matching "${searchQuery}"` : "All approved doctors"}
              />
              <MiniStat label="Sort" value={formatSortLabel(filters.sortBy)} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <MetricCard
              icon={<Stethoscope size={18} />}
              label="Doctors"
              value={doctors.length}
              description="Ready to book"
            />
            <MetricCard
              icon={<BriefcaseMedical size={18} />}
              label="Specialties"
              value={specialistCount}
              description="Care areas"
            />

            {featuredSpecialties.length > 0 && (
              <div className={`rounded-[24px] border p-4 shadow-sm backdrop-blur ${isDark ? "border-white/10 bg-white/8" : "border-white/80 bg-white/75"}`}>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Top specialties</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {featuredSpecialties.slice(0, 4).map((specialty) => (
                    <span
                      key={specialty}
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${isDark ? "border-white/10 bg-slate-950/60 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600"}`}
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={`rounded-[28px] p-5 ${glassCardClass}`}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>Refine browse</p>
            <h2 className={`mt-2 text-lg font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Search, sort, and narrow the list</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${isDark ? "border-blue-300/20 bg-blue-500/10 text-blue-200" : "border-blue-100 bg-blue-50 text-blue-700"}`}>
              {doctorCountLabel}
            </div>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold xl:hidden ${
                isDark ? "border-white/10 bg-white/8 text-slate-200" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 xl:flex-row">
          <div className="relative flex-1">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} size={20} />
            <input
              type="text"
              placeholder="Search by doctor, specialty, or hospital..."
              className={`w-full rounded-[22px] border py-4 pl-12 pr-4 outline-none transition-all ${
                isDark
                  ? "border-white/10 bg-slate-950/55 text-slate-100 focus:border-blue-400/30 focus:bg-slate-950/70 focus:ring-4 focus:ring-blue-500/10"
                  : "border-slate-200 bg-slate-50/80 text-slate-700 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              }`}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="hidden xl:grid xl:grid-cols-4 xl:gap-3">
            <FilterField label="Sort" value={filters.sortBy} onChange={(value) => updateFilter("sortBy", value)} options={[
              { value: "recommended", label: "Top rated" },
              { value: "fee_low", label: "Lowest fee" },
              { value: "experience", label: "Most experience" },
              { value: "name", label: "Name" },
            ]} />
            <FilterField label="Rating" value={filters.minRating} onChange={(value) => updateFilter("minRating", value)} options={[
              { value: "all", label: "Any rating" },
              { value: "4.5", label: "4.5+" },
              { value: "4.8", label: "4.8+" },
            ]} />
            <FilterField label="Experience" value={filters.experience} onChange={(value) => updateFilter("experience", value)} options={[
              { value: "all", label: "Any level" },
              { value: "5", label: "5+ years" },
              { value: "10", label: "10+ years" },
            ]} />
            <FilterField label="Price" value={filters.price} onChange={(value) => updateFilter("price", value)} options={[
              { value: "all", label: "Any fee" },
              { value: "500", label: "Under Rs. 500" },
              { value: "800", label: "Under Rs. 800" },
            ]} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => updateFilter("category", category)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                filters.category === category
                  ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-[0_16px_35px_-18px_rgba(37,99,235,0.7)]"
                  : isDark
                    ? "border border-white/10 bg-white/8 text-slate-300 hover:-translate-y-0.5 hover:border-blue-300/25 hover:text-blue-200"
                    : "border border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeFilterChips.length > 0 ? (
            <>
              {activeFilterChips.map((chip) => (
                <span
                  key={chip}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    isDark ? "bg-cyan-400/10 text-cyan-100" : "bg-cyan-50 text-cyan-700"
                  }`}
                >
                  <Filter size={12} />
                  {chip}
                </span>
              ))}
              <button
                type="button"
                onClick={clearFilters}
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] ${
                  isDark ? "text-slate-300 hover:text-white" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Clear all
              </button>
            </>
          ) : (
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              No extra filters applied. Patients are seeing the full recommended list.
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence initial={false}>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <DoctorCard
                  doctor={doctor}
                  badgeLabels={getDoctorBadges(doctor, index)}
                  nextAvailableLabel={getDoctorAvailabilityLabel(doctor)}
                  onPrimaryAction={() => onSelectDoctor(doctor.id)}
                  onSecondaryAction={() => onSelectDoctor(doctor.id)}
                  primaryActionLabel="Book Now"
                  secondaryActionLabel="View Profile"
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={`col-span-full rounded-[30px] border border-dashed px-6 py-16 text-center ${
                isDark ? "border-white/10 bg-slate-900/55" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl shadow-sm ${isDark ? "bg-white/8 text-slate-500" : "bg-white text-slate-300"}`}>
                <Stethoscope size={30} />
              </div>
              <h3 className={`mt-5 text-xl font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>No doctors match your current filters</h3>
              <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Try clearing the search or selecting a different specialty.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_40px_-22px_rgba(37,99,235,0.72)]"
              >
                Reset filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm xl:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className={`fixed inset-x-4 bottom-4 z-50 rounded-[30px] p-5 shadow-2xl xl:hidden ${
                isDark ? "border border-white/10 bg-slate-950/95" : "border border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">Filters</p>
                  <h3 className={`mt-2 text-lg font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Refine doctor discovery</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className={`rounded-2xl p-2 ${isDark ? "bg-white/8 text-slate-200" : "bg-slate-100 text-slate-600"}`}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <FilterField label="Sort" value={filters.sortBy} onChange={(value) => updateFilter("sortBy", value)} options={[
                  { value: "recommended", label: "Top rated" },
                  { value: "fee_low", label: "Lowest fee" },
                  { value: "experience", label: "Most experience" },
                  { value: "name", label: "Name" },
                ]} />
                <FilterField label="Rating" value={filters.minRating} onChange={(value) => updateFilter("minRating", value)} options={[
                  { value: "all", label: "Any rating" },
                  { value: "4.5", label: "4.5+" },
                  { value: "4.8", label: "4.8+" },
                ]} />
                <FilterField label="Experience" value={filters.experience} onChange={(value) => updateFilter("experience", value)} options={[
                  { value: "all", label: "Any level" },
                  { value: "5", label: "5+ years" },
                  { value: "10", label: "10+ years" },
                ]} />
                <FilterField label="Price" value={filters.price} onChange={(value) => updateFilter("price", value)} options={[
                  { value: "all", label: "Any fee" },
                  { value: "500", label: "Under Rs. 500" },
                  { value: "800", label: "Under Rs. 800" },
                ]} />
                <FilterField label="Availability" value={filters.availability} onChange={(value) => updateFilter("availability", value)} options={[
                  { value: "all", label: "Any" },
                  { value: "queue", label: "Instant queue" },
                  { value: "slots", label: "Visible slots" },
                ]} />
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-bold ${
                    isDark ? "border-white/10 bg-white/8 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-[0_16px_40px_-22px_rgba(37,99,235,0.72)]"
                >
                  Apply filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterField({ label, value, onChange, options }) {
  const { isDark } = useDashboardTheme();

  return (
    <label className={`flex min-w-[150px] items-center gap-3 rounded-[22px] border px-4 py-4 text-sm font-medium ${
      isDark ? "border-white/10 bg-slate-950/55 text-slate-300" : "border-slate-200 bg-slate-50/80 text-slate-600"
    }`}>
      <span className={`text-xs font-bold uppercase tracking-[0.18em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`min-w-0 flex-1 appearance-none bg-transparent font-semibold outline-none ${isDark ? "text-slate-100" : "text-slate-700"}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function MetricCard({ icon, label, value, description }) {
  const { isDark } = useDashboardTheme();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-[28px] border p-5 shadow-sm backdrop-blur ${isDark ? "border-white/10 bg-white/8" : "border-white/80 bg-white/72"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200/70">
          {icon}
        </span>
        <span className={`pt-1 text-xs font-bold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{label}</span>
      </div>
      <p className={`mt-5 text-3xl font-bold tracking-tight ${isDark ? "text-slate-50" : "text-slate-900"}`}>{value}</p>
      <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>{description}</p>
    </motion.div>
  );
}

function MiniStat({ label, value }) {
  const { isDark } = useDashboardTheme();

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`rounded-[22px] border px-4 py-3 shadow-sm backdrop-blur ${isDark ? "border-white/10 bg-white/8" : "border-white/80 bg-white/65"}`}
    >
      <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{label}</p>
      <p className={`mt-1 text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-700"}`}>{value}</p>
    </motion.div>
  );
}

function getDoctorBadges(doctor, index) {
  const badges = [];
  if (index === 0) {
    badges.push("Top Rated");
  }
  if (numericExperience(doctor.experience) >= 10) {
    badges.push("Recommended");
  } else if (numericFee(doctor.fee) > 0 && numericFee(doctor.fee) <= 500) {
    badges.push("Value Pick");
  }

  return badges;
}

function getDoctorAvailabilityLabel(doctor) {
  const availability = Array.isArray(doctor.availability)
    ? doctor.availability.filter(
        (slot) => Number(slot.is_available) === 1
      )
    : [];

  if (availability.length === 0) {
    return "No schedule available";
  }

  const bookedSlots = Array.isArray(doctor.booked_slots)
    ? doctor.booked_slots
    : [];

  const bookedSet = new Set(
    bookedSlots.map((slot) =>
      String(slot).replace("T", " ").slice(0, 16)
    )
  );

  const dayOrder = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const now = new Date();

  for (let offset = 0; offset < 30; offset++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + offset);

    const dayName = dayOrder[checkDate.getDay()];

    const dayAvailability = availability.find(
      (slot) => slot.day_of_week === dayName
    );

    if (!dayAvailability) {
      continue;
    }

    const [startHour, startMinute] = String(
      dayAvailability.start_time
    )
      .split(":")
      .map(Number);

    const [endHour, endMinute] = String(
      dayAvailability.end_time
    )
      .split(":")
      .map(Number);

    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    while (currentMinutes < endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;

      const slotDateTime = new Date(checkDate);
      slotDateTime.setHours(hour, minute, 0, 0);

      if (slotDateTime <= now) {
        currentMinutes += 30;
        continue;
      }

      const year = slotDateTime.getFullYear();
      const month = String(slotDateTime.getMonth() + 1).padStart(2, "0");
      const day = String(slotDateTime.getDate()).padStart(2, "0");
      const hours = String(hour).padStart(2, "0");
      const minutes = String(minute).padStart(2, "0");

      const slotKey = `${year}-${month}-${day} ${hours}:${minutes}`;

      if (!bookedSet.has(slotKey)) {
        const formattedTime = slotDateTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        const formattedDate =
          offset === 0
            ? "Today"
            : offset === 1
              ? "Tomorrow"
              : dayName;

        return `${formattedDate} · ${formattedTime}`;
      }

      currentMinutes += 30;
    }
  }

  return "No upcoming availability";
}
function formatSortLabel(value) {
  switch (value) {
    case "fee_low":
      return "Lowest fee first";
    case "experience":
      return "Most experience first";
    case "name":
      return "Name A-Z";
    case "recommended":
    default:
      return "Top rated first";
  }
}

function numericFee(value) {
  const parsed = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function numericExperience(value) {
  const parsed = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function numericRating(value) {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
}
