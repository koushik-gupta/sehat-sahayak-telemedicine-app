import React, { useEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  Download,
  Eye,
  FileImage,
  FileText,
  Filter,
  Loader2,
  PencilLine,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { resolveBackendAssetUrl } from "../../utils/runtime";
import { getGlassCardClass, getGlassPanelClass, useDashboardTheme } from "./DashboardThemeContext";

const STORAGE_KEYS = {
  important: "sehat-sahayak-records-important",
  customNames: "sehat-sahayak-records-custom-names",
  shared: "sehat-sahayak-records-shared",
};

const gradientButtonClass =
  "relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_-18px_rgba(37,99,235,0.95)]";

function HealthRecordsScreen({ t, onBack }) {
  const { isDark } = useDashboardTheme();
  const glassPanelClass = getGlassPanelClass(isDark);
  const glassCardClass = getGlassCardClass(isDark);
  const fileInputRef = useRef(null);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadState, setUploadState] = useState({ progress: 0, currentFile: "", completed: 0, total: 0 });
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewId, setPreviewId] = useState(null);
  const [renameMode, setRenameMode] = useState(false);
  const [renameDraft, setRenameDraft] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState(null);
  const [importantIds, setImportantIds] = useState([]);
  const [customNames, setCustomNames] = useState({});
  const [sharedIds, setSharedIds] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    loadLocalPreferences();
    fetchRecords();
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.important, JSON.stringify(importantIds));
  }, [importantIds]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.customNames, JSON.stringify(customNames));
  }, [customNames]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.shared, JSON.stringify(sharedIds));
  }, [sharedIds]);

  const loadLocalPreferences = () => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const savedImportant = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.important) || "[]");
      const savedCustomNames = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.customNames) || "{}");
      const savedShared = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.shared) || "[]");
      setImportantIds(Array.isArray(savedImportant) ? savedImportant : []);
      setCustomNames(savedCustomNames && typeof savedCustomNames === "object" ? savedCustomNames : {});
      setSharedIds(Array.isArray(savedShared) ? savedShared : []);
    } catch {
      setImportantIds([]);
      setCustomNames({});
      setSharedIds([]);
    }
  };

  const pushActivity = (title, detail) => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      detail,
      timestamp: new Date().toISOString(),
    };

    setActivityLog((prev) => [entry, ...prev].slice(0, 8));
  };

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await fetch("/api/v1/user/documents", { credentials: "include" });
      if (!response.ok) {
        throw new Error("Failed to fetch records");
      }

      const data = await response.json();
      const nextRecords = Array.isArray(data) ? data : [];
      setRecords(nextRecords);

      setActivityLog((prev) => {
        if (prev.length > 0) {
          return prev;
        }

        return nextRecords
          .slice()
          .sort((a, b) => new Date(b.uploaded_at || 0) - new Date(a.uploaded_at || 0))
          .slice(0, 4)
          .map((record) => ({
            id: `seed-${record.id}`,
            title: "Uploaded to records",
            detail: displayDocumentName(record.file_name),
            timestamp: record.uploaded_at || new Date().toISOString(),
          }));
      });
    } catch (err) {
      console.error(err);
      setError("Could not load health records.");
    } finally {
      setIsLoading(false);
    }
  };

  const enhancedRecords = records.map((record) => {
    const meta = buildRecordMeta(record, customNames, importantIds, sharedIds);
    return {
      ...record,
      ...meta,
    };
  });

  const availableTags = Array.from(
    new Set(enhancedRecords.flatMap((record) => record.tags))
  ).sort((left, right) => left.localeCompare(right));

  const filteredRecords = enhancedRecords
    .filter((record) => {
      const matchesSearch =
        !searchQuery ||
        record.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === "all" || record.typeFilter === typeFilter;
      const matchesTag = tagFilter === "all" || record.tags.includes(tagFilter);
      const matchesDate = matchesDateFilter(record.uploaded_at, dateFilter);

      return matchesSearch && matchesType && matchesTag && matchesDate;
    })
    .sort((left, right) => sortRecords(left, right, sortBy));

  const previewRecord = enhancedRecords.find((record) => record.id === previewId) || null;
  const recentCount = enhancedRecords.filter((record) => record.isRecent).length;
  const importantCount = enhancedRecords.filter((record) => record.isImportant).length;
  const sharedCount = enhancedRecords.filter((record) => record.isShared).length;
  const totalSelected = selectedIds.length;

  const statCards = [
    {
      label: "Total records",
      value: enhancedRecords.length,
      helper: enhancedRecords.length > 0 ? "Secure documents ready for care" : "Start your secure record vault",
      accent: "from-cyan-400/18 via-blue-500/14 to-indigo-500/16",
    },
    {
      label: "Recently uploaded",
      value: recentCount,
      helper: recentCount > 0 ? "Fresh documents highlighted for quick review" : "No recent uploads in the last 30 days",
      accent: "from-blue-400/18 via-cyan-400/14 to-teal-400/14",
    },
    {
      label: "Important",
      value: importantCount,
      helper: importantCount > 0 ? "Pinned items stay front-of-mind" : "Star records you want to revisit quickly",
      accent: "from-amber-400/16 via-orange-400/12 to-rose-400/14",
    },
    {
      label: "Shared records",
      value: sharedCount,
      helper: sharedCount > 0 ? "Recently shared from this workspace" : "Share securely when doctors request files",
      accent: "from-emerald-400/16 via-cyan-400/12 to-blue-400/14",
    },
  ];

  const activeFilters = [
    typeFilter !== "all" ? { key: "type", label: `Type: ${formatFilterLabel(typeFilter)}`, onClear: () => setTypeFilter("all") } : null,
    dateFilter !== "all" ? { key: "date", label: `Date: ${formatFilterLabel(dateFilter)}`, onClear: () => setDateFilter("all") } : null,
    tagFilter !== "all" ? { key: "tag", label: `Tag: ${tagFilter}`, onClear: () => setTagFilter("all") } : null,
    searchQuery ? { key: "search", label: `Search: ${searchQuery}`, onClear: () => setSearchQuery("") } : null,
  ].filter(Boolean);

  const uploadLabel = uploadState.total > 1 ? `${uploadState.completed}/${uploadState.total} files synced` : "Preparing your record";

  const openPreview = (record, nextRenameMode = false) => {
    setPreviewId(record.id);
    setRenameMode(nextRenameMode);
    setRenameDraft(record.displayName);
  };

  const closePreview = () => {
    setPreviewId(null);
    setRenameMode(false);
    setRenameDraft("");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const runUpload = async (fileList) => {
    const files = Array.from(fileList || []).filter(Boolean);
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    setError("");
    let successCount = 0;
    const failures = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const maxBeforeCompletion = ((index + 0.85) / files.length) * 100;
      const intervalId = window.setInterval(() => {
        setUploadState((prev) => ({
          ...prev,
          currentFile: file.name,
          total: files.length,
          completed: index,
          progress: Math.min(prev.progress + 3.5, maxBeforeCompletion),
        }));
      }, 120);

      try {
        const formData = new FormData();
        formData.append("document", file);

        const response = await fetch("/api/v1/user/upload-documents", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Upload failed");
        }

        successCount += 1;
        pushActivity("Uploaded to records", file.name);
      } catch (err) {
        failures.push(err.message);
      } finally {
        window.clearInterval(intervalId);
        setUploadState({
          currentFile: file.name,
          total: files.length,
          completed: index + 1,
          progress: ((index + 1) / files.length) * 100,
        });
      }
    }

    await fetchRecords();
    setIsUploading(false);
    setUploadState({ progress: 0, currentFile: "", completed: 0, total: 0 });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (successCount > 0 && failures.length === 0) {
      setToast({
        tone: "success",
        title: successCount > 1 ? "Records uploaded" : "Record uploaded",
        message: successCount > 1 ? `${successCount} documents are now in your vault.` : "Your record is now available in your vault.",
      });
    } else if (successCount > 0) {
      setToast({
        tone: "warning",
        title: "Upload completed with issues",
        message: `${successCount} uploaded, ${failures.length} failed.`,
      });
    } else {
      setToast({
        tone: "error",
        title: "Upload failed",
        message: failures[0] || "Unable to upload the selected file.",
      });
    }
  };

  const handleFileUpload = async (event) => {
    await runUpload(event.target.files);
  };

  const deleteRecordById = async (docId) => {
    const response = await fetch(`/api/v1/user/delete-document/${docId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to delete record");
    }

    const deletedRecord = enhancedRecords.find((record) => record.id === docId);
    setRecords((prev) => prev.filter((record) => record.id !== docId));
    setSelectedIds((prev) => prev.filter((id) => id !== docId));
    setImportantIds((prev) => prev.filter((id) => id !== docId));
    setSharedIds((prev) => prev.filter((id) => id !== docId));
    setCustomNames((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });

    if (previewId === docId) {
      closePreview();
    }

    pushActivity("Deleted record", deletedRecord?.displayName || "Medical record");
  };

  const handleDeleteRecord = async (docId, event) => {
    if (event) {
      event.stopPropagation();
    }

    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      await deleteRecordById(docId);
      setToast({
        tone: "success",
        title: "Record deleted",
        message: "The selected record was removed.",
      });
    } catch (err) {
      setToast({
        tone: "error",
        title: "Delete failed",
        message: err.message,
      });
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    if (!window.confirm(`Delete ${selectedIds.length} selected record${selectedIds.length > 1 ? "s" : ""}?`)) {
      return;
    }

    const idsToDelete = [...selectedIds];
    try {
      for (let index = 0; index < idsToDelete.length; index += 1) {
        await deleteRecordById(idsToDelete[index]);
      }

      setToast({
        tone: "success",
        title: "Records deleted",
        message: `${idsToDelete.length} selected record${idsToDelete.length > 1 ? "s were" : " was"} removed.`,
      });
    } catch (err) {
      setToast({
        tone: "error",
        title: "Batch delete failed",
        message: err.message,
      });
    }
  };

  const toggleSelect = (recordId, event) => {
    event.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(recordId) ? prev.filter((id) => id !== recordId) : [...prev, recordId]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleToggleImportant = (record, event) => {
    if (event) {
      event.stopPropagation();
    }

    setImportantIds((prev) => {
      const isAlreadyImportant = prev.includes(record.id);
      const next = isAlreadyImportant ? prev.filter((id) => id !== record.id) : [...prev, record.id];
      pushActivity(isAlreadyImportant ? "Removed from important" : "Marked as important", record.displayName);
      setToast({
        tone: "success",
        title: isAlreadyImportant ? "Removed from important" : "Saved to important",
        message: isAlreadyImportant ? "This record is no longer pinned." : "This record was pinned for quick access.",
      });
      return next;
    });
  };

  const handleRenameSave = () => {
    if (!previewRecord) {
      return;
    }

    const nextName = renameDraft.trim();
    if (!nextName) {
      return;
    }

    setCustomNames((prev) => ({
      ...prev,
      [previewRecord.id]: nextName,
    }));
    setRenameMode(false);
    pushActivity("Renamed locally", `${previewRecord.displayName} -> ${nextName}`);
    setToast({
      tone: "success",
      title: "Display name updated",
      message: "This rename is saved locally in your dashboard.",
    });
  };

  const handleDownloadRecord = (record, event) => {
    if (event) {
      event.stopPropagation();
    }

    const link = document.createElement("a");
    link.href = resolveBackendAssetUrl(record.file_url);
    link.download = record.displayName;
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
    pushActivity("Downloaded record", record.displayName);
  };

  const handleBatchDownload = () => {
    const recordsToDownload = enhancedRecords.filter((record) => selectedIds.includes(record.id));
    recordsToDownload.forEach((record) => handleDownloadRecord(record));
    setToast({
      tone: "success",
      title: "Downloads started",
      message: `${recordsToDownload.length} file${recordsToDownload.length > 1 ? "s" : ""} queued for download.`,
    });
  };

  const handleShareRecord = async (record, event) => {
    if (event) {
      event.stopPropagation();
    }

    const shareUrl = resolveBackendAssetUrl(record.file_url);

    try {
      if (navigator.share) {
        await navigator.share({
          title: record.displayName,
          text: `Health record: ${record.displayName}`,
          url: shareUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        throw new Error("Sharing is not available on this device.");
      }

      setSharedIds((prev) => (prev.includes(record.id) ? prev : [...prev, record.id]));
      pushActivity("Shared record", record.displayName);
      setToast({
        tone: "success",
        title: "Share ready",
        message: navigator.share ? "Share sheet opened." : "Record link copied to clipboard.",
      });
    } catch (err) {
      setToast({
        tone: "error",
        title: "Share unavailable",
        message: err.message,
      });
    }
  };

  const handleBatchShare = async () => {
    const recordsToShare = enhancedRecords.filter((record) => selectedIds.includes(record.id));

    if (recordsToShare.length === 0) {
      return;
    }

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard sharing is not available on this device.");
      }

      const combinedLinks = recordsToShare
        .map((record) => `${record.displayName}: ${resolveBackendAssetUrl(record.file_url)}`)
        .join("\n");

      await navigator.clipboard.writeText(combinedLinks);
      setSharedIds((prev) => Array.from(new Set([...prev, ...recordsToShare.map((record) => record.id)])));
      pushActivity("Prepared shared bundle", `${recordsToShare.length} records copied to clipboard`);
      setToast({
        tone: "success",
        title: "Links copied",
        message: `${recordsToShare.length} record link${recordsToShare.length > 1 ? "s" : ""} copied to clipboard.`,
      });
    } catch (err) {
      setToast({
        tone: "error",
        title: "Batch share unavailable",
        message: err.message,
      });
    }
  };

  return (
    <div className="records-workspace relative w-full pb-10">
      <motion.div
        animate={{ y: [0, -14, 0], x: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className={`pointer-events-none absolute left-0 top-12 h-56 w-56 rounded-full blur-3xl ${
          isDark ? "bg-cyan-400/12" : "bg-cyan-300/25"
        }`}
      />
      <motion.div
        animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className={`pointer-events-none absolute right-6 top-28 h-64 w-64 rounded-full blur-3xl ${
          isDark ? "bg-blue-500/10" : "bg-blue-200/24"
        }`}
      />

      <div className="relative z-10 space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={`relative overflow-hidden rounded-[32px] p-5 sm:p-6 ${glassPanelClass}`}
        >
          <div
            className={`pointer-events-none absolute inset-0 ${
              isDark
                ? "bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.18),rgba(15,23,42,0.04))]"
                : "bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,255,255,0.2))]"
            }`}
          />
          <div className="hero-grid-overlay absolute inset-0 opacity-35" />

          <div className="relative flex flex-col gap-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex items-start gap-4">
                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onBack}
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border backdrop-blur-xl ${
                    isDark
                      ? "border-white/10 bg-white/8 text-slate-200 hover:border-cyan-300/25 hover:bg-white/12"
                      : "border-slate-200/90 bg-white/92 text-slate-700 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <ChevronLeft size={20} />
                </motion.button>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${
                        isDark ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200" : "border-cyan-200 bg-cyan-50 text-cyan-700"
                      }`}
                    >
                      <Sparkles size={12} />
                      Smart health vault
                    </div>
                    {totalSelected > 0 && (
                      <motion.div
                        layout
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${
                          isDark ? "border-white/10 bg-white/8 text-slate-200" : "border-slate-200 bg-white/90 text-slate-700"
                        }`}
                      >
                        <Check size={14} />
                        {totalSelected} selected
                      </motion.div>
                    )}
                  </div>

                  <h1 className={`mt-3 text-3xl font-semibold tracking-tight ${isDark ? "text-slate-50" : "text-slate-900"}`}>
                    {t.healthRecords || "Health Records"}
                  </h1>
                  <p className={`mt-2 max-w-2xl text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    Manage prescriptions, reports, scans, and certificates in one polished workspace without changing how your records are stored.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:w-[25rem]">
                <motion.button
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className={`${gradientButtonClass} ${isUploading ? "cursor-not-allowed opacity-80" : ""}`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    {isUploading ? "Uploading..." : "Upload New Record"}
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => setMobileFiltersOpen(true)}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold backdrop-blur-xl lg:hidden ${
                    isDark ? "border-white/10 bg-white/8 text-slate-100" : "border-slate-200/85 bg-white/92 text-slate-700"
                  }`}
                >
                  <Filter size={16} />
                  Filters & Sort
                </motion.button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {statCards.map((card, index) => (
                    <StatCard key={card.label} card={card} index={index} isDark={isDark} />
                  ))}
                </div>

                <div className={`rounded-[28px] p-4 ${glassCardClass}`}>
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.68fr))]">
                    <SearchInput
                      isDark={isDark}
                      value={searchQuery}
                      onChange={setSearchQuery}
                    />
                    <FilterSelect
                      isDark={isDark}
                      label="Type"
                      value={typeFilter}
                      onChange={setTypeFilter}
                      options={[
                        { value: "all", label: "All types" },
                        { value: "pdf", label: "PDF" },
                        { value: "image", label: "Images" },
                        { value: "prescription", label: "Prescriptions" },
                        { value: "report", label: "Reports" },
                        { value: "scan", label: "Scans" },
                      ]}
                      className="hidden lg:block"
                    />
                    <FilterSelect
                      isDark={isDark}
                      label="Date"
                      value={dateFilter}
                      onChange={setDateFilter}
                      options={[
                        { value: "all", label: "Any time" },
                        { value: "30d", label: "Last 30 days" },
                        { value: "90d", label: "Last 90 days" },
                        { value: "year", label: "This year" },
                        { value: "older", label: "Older" },
                      ]}
                      className="hidden lg:block"
                    />
                    <FilterSelect
                      isDark={isDark}
                      label="Tag"
                      value={tagFilter}
                      onChange={setTagFilter}
                      options={[{ value: "all", label: "All tags" }, ...availableTags.map((tag) => ({ value: tag, label: tag }))]}
                      className="hidden lg:block"
                    />
                    <FilterSelect
                      isDark={isDark}
                      label="Sort"
                      value={sortBy}
                      onChange={setSortBy}
                      options={[
                        { value: "newest", label: "Newest" },
                        { value: "oldest", label: "Oldest" },
                        { value: "name", label: "Name" },
                      ]}
                      className="hidden lg:block"
                    />
                    <div className={`hidden items-center justify-end rounded-2xl border px-4 text-sm font-medium lg:flex ${
                      isDark ? "border-white/10 bg-white/6 text-slate-300" : "border-slate-200/80 bg-slate-50/70 text-slate-600"
                    }`}>
                      {filteredRecords.length} visible
                    </div>
                  </div>

                  <AnimatePresence>
                    {activeFilters.length > 0 && (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mt-4 flex flex-wrap gap-2"
                      >
                        {activeFilters.map((filterChip) => (
                          <motion.button
                            layout
                            key={filterChip.key}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={filterChip.onClear}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${
                              isDark ? "border-white/10 bg-white/8 text-slate-200" : "border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            {filterChip.label}
                            <X size={14} />
                          </motion.button>
                        ))}
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setTypeFilter("all");
                            setDateFilter("all");
                            setTagFilter("all");
                          }}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                            isDark ? "text-cyan-200" : "text-blue-700"
                          }`}
                        >
                          Clear all
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <DragAndDropPanel
                  isDark={isDark}
                  glassCardClass={glassCardClass}
                  isUploading={isUploading}
                  dragActive={dragActive}
                  uploadState={uploadState}
                  uploadLabel={uploadLabel}
                  onUploadClick={handleUploadClick}
                  onDragStateChange={setDragActive}
                  onFilesDropped={runUpload}
                />
              </div>

              <SecondaryPanel
                isDark={isDark}
                glassCardClass={glassCardClass}
                activityLog={activityLog}
                records={enhancedRecords}
                onOpenRecord={openPreview}
              />
            </div>
          </div>
        </motion.section>

        {error ? (
          <div className={`rounded-[24px] p-4 text-center ${isDark ? "bg-rose-500/12 text-rose-100" : "bg-red-50 text-red-600"}`}>
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px]">
          <section className={`rounded-[32px] p-4 sm:p-5 ${glassPanelClass}`}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className={`text-xl font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Your record library</h2>
                <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                  Tap any card for preview, metadata, and quick actions.
                </p>
              </div>

              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
                isDark ? "border-white/10 bg-white/8 text-slate-200" : "border-slate-200 bg-white/90 text-slate-700"
              }`}>
                <ShieldCheck size={16} className="text-cyan-500" />
                Healthcare-grade access
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <LoadingRecordCard key={index} isDark={isDark} glassCardClass={glassCardClass} />
                ))}
              </div>
            ) : filteredRecords.length === 0 ? (
              <EmptyRecordsState
                isDark={isDark}
                glassCardClass={glassCardClass}
                hasAnyRecords={enhancedRecords.length > 0}
                onUploadClick={handleUploadClick}
              />
            ) : (
              <motion.div layout className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                <AnimatePresence>
                  {filteredRecords.map((record, index) => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      index={index}
                      isDark={isDark}
                      isSelected={selectedIds.includes(record.id)}
                      onOpen={openPreview}
                      onSelect={toggleSelect}
                      onDelete={handleDeleteRecord}
                      onToggleImportant={handleToggleImportant}
                      onShare={handleShareRecord}
                      onDownload={handleDownloadRecord}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </section>

          <aside className="space-y-4 xl:hidden">
            <SecondaryPanel
              isDark={isDark}
              glassCardClass={glassCardClass}
              activityLog={activityLog}
              records={enhancedRecords}
              onOpenRecord={openPreview}
            />
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {totalSelected > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-1/2 z-50 w-[min(calc(100%-1.5rem),42rem)] -translate-x-1/2"
          >
            <div className={`flex flex-wrap items-center justify-between gap-3 rounded-[28px] border p-3 backdrop-blur-2xl ${
              isDark
                ? "border-white/10 bg-slate-950/88 text-slate-100 shadow-[0_32px_80px_-30px_rgba(2,6,23,0.92)]"
                : "border-white/50 bg-white/88 text-slate-800 shadow-[0_30px_80px_-28px_rgba(15,23,42,0.2)]"
            }`}>
              <div>
                <p className="text-sm font-semibold">{totalSelected} record{totalSelected > 1 ? "s" : ""} selected</p>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Batch actions are frontend-only wrappers around the same existing endpoints.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <FloatingActionButton label="Download" icon={<Download size={16} />} onClick={handleBatchDownload} isDark={isDark} />
                <FloatingActionButton label="Share" icon={<Share2 size={16} />} onClick={handleBatchShare} isDark={isDark} />
                <FloatingActionButton label="Delete" icon={<Trash2 size={16} />} onClick={handleBatchDelete} isDark={isDark} tone="danger" />
                <FloatingActionButton label="Clear" icon={<X size={16} />} onClick={clearSelection} isDark={isDark} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewRecord && (
          <PreviewDrawer
            record={previewRecord}
            renameMode={renameMode}
            renameDraft={renameDraft}
            setRenameDraft={setRenameDraft}
            setRenameMode={setRenameMode}
            onClose={closePreview}
            onRenameSave={handleRenameSave}
            onToggleImportant={handleToggleImportant}
            onShare={handleShareRecord}
            onDownload={handleDownloadRecord}
            onDelete={handleDeleteRecord}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <MobileFiltersDrawer
            isDark={isDark}
            typeFilter={typeFilter}
            dateFilter={dateFilter}
            tagFilter={tagFilter}
            sortBy={sortBy}
            setTypeFilter={setTypeFilter}
            setDateFilter={setDateFilter}
            setTagFilter={setTagFilter}
            setSortBy={setSortBy}
            availableTags={availableTags}
            onClose={() => setMobileFiltersOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <ToastMessage toast={toast} isDark={isDark} />}
      </AnimatePresence>
    </div>
  );
}

function SearchInput({ isDark, value, onChange }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.label
      layout
      animate={isFocused ? { y: -1 } : { y: 0 }}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
        isFocused
          ? isDark
            ? "border-cyan-300/30 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(103,232,249,0.15)]"
            : "border-cyan-300 bg-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.2)]"
          : isDark
            ? "border-white/10 bg-white/6"
            : "border-slate-200/85 bg-white/90"
      }`}
    >
      <Search size={18} className={isFocused ? "text-cyan-500" : isDark ? "text-slate-400" : "text-slate-400"} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search by record name, type, or tag"
        className={`w-full bg-transparent text-sm outline-none ${
          isDark ? "text-slate-50 placeholder:text-slate-500" : "text-slate-900 placeholder:text-slate-400"
        }`}
      />
    </motion.label>
  );
}

function FilterSelect({ isDark, label, value, onChange, options, className = "" }) {
  return (
    <label className={`space-y-1 ${className}`}>
      <span className={`block text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${
          isDark
            ? "border-white/10 bg-white/6 text-slate-100"
            : "border-slate-200/85 bg-white/90 text-slate-700"
        }`}
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

function StatCard({ card, index, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className={`relative overflow-hidden rounded-[28px] border p-5 ${
        isDark
          ? "border-white/10 bg-slate-900/62 shadow-[0_24px_60px_-28px_rgba(2,6,23,0.86)]"
          : "border-slate-200/90 bg-white/88 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)]"
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${card.accent}`} />
      <div className={`absolute inset-0 ${isDark ? "bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_48%)]" : "bg-[linear-gradient(120deg,rgba(255,255,255,0.42),transparent_48%)]"}`} />
      <div className="relative">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{card.label}</p>
        <p className={`mt-4 text-3xl font-semibold tracking-tight ${isDark ? "text-slate-50" : "text-slate-900"}`}>
          <CountUp value={card.value} />
        </p>
        <p className={`mt-2 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{card.helper}</p>
      </div>
    </motion.div>
  );
}

function DragAndDropPanel({
  isDark,
  glassCardClass,
  isUploading,
  dragActive,
  uploadState,
  uploadLabel,
  onUploadClick,
  onDragStateChange,
  onFilesDropped,
}) {
  const dragLabel = dragActive ? "Drop files to start upload" : "Drag and drop records here";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onDragEnter={(event) => {
        event.preventDefault();
        onDragStateChange(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        onDragStateChange(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        if (event.currentTarget.contains(event.relatedTarget)) {
          return;
        }
        onDragStateChange(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDragStateChange(false);
        onFilesDropped(event.dataTransfer.files);
      }}
      className={`relative overflow-hidden rounded-[30px] border border-dashed p-5 ${glassCardClass} ${
        dragActive
          ? isDark
            ? "border-cyan-300/45 shadow-[0_0_0_1px_rgba(103,232,249,0.2)]"
            : "border-cyan-300 shadow-[0_0_0_1px_rgba(34,211,238,0.2)]"
          : ""
      }`}
    >
      <div className={`absolute inset-0 ${dragActive ? "opacity-100" : "opacity-80"} ${
        isDark
          ? "bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.1),rgba(15,23,42,0.03))]"
          : "bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.55),rgba(255,255,255,0.15))]"
      }`} />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] border ${
            isDark ? "border-white/10 bg-white/8 text-cyan-200" : "border-slate-200/80 bg-white/80 text-cyan-700"
          }`}>
            {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Upload zone</h3>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{dragLabel}</p>
            <p className={`mt-2 text-xs uppercase tracking-[0.24em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              PDF, JPG, JPEG, PNG
            </p>
          </div>
        </div>

        <div className="w-full max-w-md space-y-3">
          <button onClick={onUploadClick} className={`w-full ${gradientButtonClass}`}>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Upload size={16} />
              Choose files
            </span>
          </button>

          <div className={`rounded-2xl border px-4 py-3 ${
            isDark ? "border-white/10 bg-white/8" : "border-slate-200/85 bg-white/88"
          }`}>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.24em]">
              <span className={isDark ? "text-slate-400" : "text-slate-500"}>{uploadLabel}</span>
              <span className={isDark ? "text-cyan-200" : "text-cyan-700"}>{Math.round(uploadState.progress)}%</span>
            </div>
            <div className={`h-2 rounded-full ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
              <motion.div
                animate={{ width: `${uploadState.progress}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
                className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
              />
            </div>
            <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
              {isUploading && uploadState.currentFile ? `Syncing ${uploadState.currentFile}` : "Your documents stay in the existing secure upload flow."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SecondaryPanel({ isDark, glassCardClass, activityLog, records, onOpenRecord }) {
  const latestRecords = records
    .slice()
    .sort((left, right) => new Date(right.uploaded_at || 0) - new Date(left.uploaded_at || 0))
    .slice(0, 3);

  return (
    <div className="hidden space-y-4 xl:block">
      <div className={`rounded-[30px] p-5 ${glassCardClass}`}>
        <div className="mb-4 flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-[18px] border ${
            isDark ? "border-white/10 bg-white/8 text-cyan-200" : "border-slate-200/85 bg-white/90 text-cyan-700"
          }`}>
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Recent activity</h3>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Uploads, shares, downloads, and local highlights</p>
          </div>
        </div>

        <div className="space-y-3">
          {activityLog.length === 0 ? (
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Activity appears here as you manage files.</p>
          ) : (
            activityLog.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className={`rounded-[22px] border p-4 ${
                  isDark ? "border-white/8 bg-white/6" : "border-slate-200/85 bg-white/75"
                }`}
              >
                <p className={`font-medium ${isDark ? "text-slate-100" : "text-slate-800"}`}>{item.title}</p>
                <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>{item.detail}</p>
                <p className={`mt-2 text-xs uppercase tracking-[0.22em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {formatRelativeLabel(item.timestamp)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`rounded-[30px] p-5 ${glassCardClass}`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className={`font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Quick access</h3>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Your latest saved files</p>
          </div>
          <Tag size={16} className="text-cyan-500" />
        </div>

        <div className="space-y-3">
          {latestRecords.map((record) => (
            <motion.button
              key={record.id}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => onOpenRecord(record)}
              className={`flex w-full items-center gap-3 rounded-[22px] border p-3 text-left ${
                isDark ? "border-white/8 bg-white/6 text-slate-100" : "border-slate-200/85 bg-white/75 text-slate-800"
              }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] ${record.badgeClass}`}>
                {record.icon}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{record.displayName}</p>
                <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{record.categoryLabel}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className={`rounded-[30px] p-5 ${glassCardClass}`}>
        <h3 className={`font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Management tips</h3>
        <div className="mt-4 space-y-3">
          {[
            "Star records you frequently show during consultations.",
            "Use search by name, tag, or type to find reports quickly.",
            "Open the preview drawer before sharing to double-check the file.",
          ].map((tip) => (
            <div
              key={tip}
              className={`rounded-[22px] border p-4 text-sm leading-6 ${
                isDark ? "border-white/8 bg-white/6 text-slate-300" : "border-slate-200/85 bg-white/75 text-slate-600"
              }`}
            >
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecordCard({
  record,
  index,
  isDark,
  isSelected,
  onOpen,
  onSelect,
  onDelete,
  onToggleImportant,
  onShare,
  onDownload,
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -8, scale: 1.01 }}
      onClick={() => onOpen(record)}
      className={`group relative cursor-pointer overflow-hidden rounded-[30px] border p-5 backdrop-blur-2xl transition-all ${
        isSelected
          ? isDark
            ? "border-cyan-300/35 bg-slate-900/80 shadow-[0_28px_60px_-28px_rgba(34,211,238,0.35)]"
            : "border-cyan-300 bg-white/95 shadow-[0_28px_60px_-28px_rgba(34,211,238,0.24)]"
          : isDark
            ? "border-white/10 bg-slate-900/70 shadow-[0_24px_60px_-28px_rgba(2,6,23,0.84)]"
            : "border-slate-200/90 bg-white/92 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.14)]"
      }`}
    >
      <div className={`absolute inset-0 opacity-90 ${record.surfaceGlow}`} />
      <div className={`absolute inset-x-0 top-0 h-20 ${isDark ? "bg-gradient-to-b from-white/6 to-transparent" : "bg-gradient-to-b from-white/55 to-transparent"}`} />

      {record.isRecent && (
        <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white shadow-[0_0_18px_rgba(34,211,238,0.45)]">
          New
        </div>
      )}

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={(event) => onSelect(record.id, event)}
              className={`mt-1 flex h-6 w-6 items-center justify-center rounded-md border ${
                isSelected
                  ? "border-cyan-400 bg-cyan-500 text-white"
                  : isDark
                    ? "border-white/15 bg-white/8 text-transparent"
                    : "border-slate-200 bg-white text-transparent"
              }`}
              title="Select record"
            >
              <Check size={14} />
            </button>

            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border ${record.badgeClass}`}>
              {record.icon}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className={`line-clamp-2 text-lg font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`} title={record.displayName}>
                  {record.displayName}
                </p>
                {record.isImportant && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${
                    isDark ? "border-amber-400/20 bg-amber-400/10 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}>
                    <Star size={12} className="fill-current" />
                    Important
                  </span>
                )}
              </div>
              <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{record.categoryLabel}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {record.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                isDark ? "border-white/10 bg-white/8 text-slate-300" : "border-slate-200 bg-white/80 text-slate-600"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className={`mt-5 grid grid-cols-2 gap-3 rounded-[24px] border p-4 ${
          isDark ? "border-white/8 bg-white/6" : "border-slate-200/85 bg-white/75"
        }`}>
          <MetaItem label="Type" value={record.typeLabel} isDark={isDark} />
          <MetaItem label="Date" value={formatShortDate(record.uploaded_at)} isDark={isDark} />
          <MetaItem label="Size" value={record.sizeLabel} isDark={isDark} />
          <MetaItem label="Source" value={record.sourceLabel} isDark={isDark} />
        </div>

        <div className={`mt-5 flex flex-wrap items-center gap-2 opacity-100 transition-all md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100`}>
          <QuickAction label="Preview" icon={<Eye size={15} />} onClick={(event) => { event.stopPropagation(); onOpen(record); }} isDark={isDark} />
          <QuickAction label="Download" icon={<Download size={15} />} onClick={(event) => onDownload(record, event)} isDark={isDark} />
          <QuickAction label="Share" icon={<Share2 size={15} />} onClick={(event) => onShare(record, event)} isDark={isDark} />
          <QuickAction label="Rename" icon={<PencilLine size={15} />} onClick={(event) => { event.stopPropagation(); onOpen(record, true); }} isDark={isDark} />
          <QuickAction
            label={record.isImportant ? "Unstar" : "Important"}
            icon={<Star size={15} className={record.isImportant ? "fill-current" : ""} />}
            onClick={(event) => onToggleImportant(record, event)}
            isDark={isDark}
          />
          <QuickAction label="Delete" icon={<Trash2 size={15} />} onClick={(event) => onDelete(record.id, event)} isDark={isDark} tone="danger" />
        </div>
      </div>
    </motion.article>
  );
}

function MetaItem({ label, value, isDark }) {
  return (
    <div>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
      <p className={`mt-2 text-sm font-medium ${isDark ? "text-slate-100" : "text-slate-700"}`}>{value}</p>
    </div>
  );
}

function QuickAction({ label, icon, onClick, isDark, tone = "default" }) {
  const toneClass =
    tone === "danger"
      ? isDark
        ? "border-rose-400/15 bg-rose-500/10 text-rose-100 hover:border-rose-300/30 hover:bg-rose-500/18"
        : "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100"
      : isDark
        ? "border-white/10 bg-white/8 text-slate-100 hover:border-cyan-300/25 hover:bg-white/12"
        : "border-slate-200 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-white";

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${toneClass}`}
    >
      {icon}
      {label}
    </motion.button>
  );
}

function LoadingRecordCard({ isDark, glassCardClass }) {
  return (
    <div className={`rounded-[30px] p-5 ${glassCardClass}`}>
      <div className="dashboard-shimmer h-16 w-16 rounded-[22px]" />
      <div className="dashboard-shimmer mt-4 h-6 w-3/4 rounded-full" />
      <div className="dashboard-shimmer mt-3 h-4 w-1/2 rounded-full" />
      <div className="dashboard-shimmer mt-5 h-24 w-full rounded-[22px]" />
      <div className={`mt-5 h-10 rounded-full ${isDark ? "bg-white/6" : "bg-slate-100/80"}`} />
    </div>
  );
}

function EmptyRecordsState({ isDark, glassCardClass, hasAnyRecords, onUploadClick }) {
  return (
    <div className={`rounded-[30px] p-8 text-center ${glassCardClass}`}>
      <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border ${
        isDark ? "border-white/10 bg-white/8 text-cyan-200" : "border-slate-200/85 bg-white/90 text-cyan-700"
      }`}>
        <FileText size={30} />
      </div>
      <h3 className={`mt-5 text-xl font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>
        {hasAnyRecords ? "No records match your filters" : "No records uploaded yet"}
      </h3>
      <p className={`mx-auto mt-3 max-w-xl text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
        {hasAnyRecords
          ? "Try adjusting search, tags, or sort settings to bring more files back into view."
          : "Upload prescriptions, reports, and scans here so they are ready before your next consultation."}
      </p>
      {!hasAnyRecords && (
        <button onClick={onUploadClick} className={`mt-5 ${gradientButtonClass}`}>
          <span className="relative z-10 inline-flex items-center gap-2">
            <Upload size={16} />
            Upload first record
          </span>
        </button>
      )}
    </div>
  );
}

function FloatingActionButton({ label, icon, onClick, isDark, tone = "default" }) {
  return (
    <motion.button
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold ${
        tone === "danger"
          ? isDark
            ? "border-rose-400/15 bg-rose-500/10 text-rose-100"
            : "border-rose-200 bg-rose-50 text-rose-700"
          : isDark
            ? "border-white/10 bg-white/8 text-slate-100"
            : "border-slate-200 bg-white text-slate-700"
      }`}
    >
      {icon}
      {label}
    </motion.button>
  );
}

function PreviewDrawer({
  record,
  renameMode,
  renameDraft,
  setRenameDraft,
  setRenameMode,
  onClose,
  onRenameSave,
  onToggleImportant,
  onShare,
  onDownload,
  onDelete,
  isDark,
}) {
  const previewUrl = resolveBackendAssetUrl(record.file_url);
  const isPdf = record.typeFilter === "pdf";
  const isImage = record.typeFilter === "image";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm"
      />

      <motion.aside
        initial={{ opacity: 0, x: 48 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 48 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className={`fixed inset-y-3 right-3 z-[60] w-[min(100%-1.5rem,34rem)] overflow-hidden rounded-[32px] border ${
          isDark
            ? "border-white/10 bg-slate-950/94 text-slate-100 shadow-[0_30px_90px_-30px_rgba(2,6,23,0.96)]"
            : "border-white/45 bg-white/94 text-slate-800 shadow-[0_30px_90px_-30px_rgba(15,23,42,0.26)]"
        }`}
      >
        <div className="hero-grid-overlay absolute inset-0 opacity-30" />
        <div className={`absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_30%)]"
            : "bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_30%)]"
        }`} />

        <div className="relative flex h-full flex-col">
          <div className={`flex items-start justify-between gap-4 border-b px-5 py-4 ${
            isDark ? "border-white/10" : "border-slate-200/80"
          }`}>
            <div className="min-w-0">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-cyan-200/80" : "text-cyan-700"}`}>Document preview</p>
              <h3 className="mt-2 truncate text-xl font-semibold">{record.displayName}</h3>
              <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{record.categoryLabel}</p>
            </div>
            <button
              onClick={onClose}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${
                isDark ? "border-white/10 bg-white/8 text-slate-100" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className={`overflow-hidden rounded-[28px] border ${
              isDark ? "border-white/10 bg-slate-900/80" : "border-slate-200/80 bg-slate-50/80"
            }`}>
              {isImage ? (
                <img src={previewUrl} alt={record.displayName} className="h-[18rem] w-full object-cover sm:h-[22rem]" />
              ) : isPdf ? (
                <iframe title={record.displayName} src={previewUrl} className="h-[22rem] w-full bg-white" />
              ) : (
                <div className="flex h-[18rem] flex-col items-center justify-center gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-[22px] ${record.badgeClass}`}>
                    {record.icon}
                  </div>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Preview not available for this file type. Use download or open in a new tab.</p>
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoPanel title="Uploaded" value={formatShortDate(record.uploaded_at)} isDark={isDark} />
              <InfoPanel title="Size" value={record.sizeLabel} isDark={isDark} />
              <InfoPanel title="Type" value={record.typeLabel} isDark={isDark} />
              <InfoPanel title="Source" value={record.sourceLabel} isDark={isDark} />
            </div>

            <div className={`mt-5 rounded-[28px] border p-4 ${
              isDark ? "border-white/10 bg-white/6" : "border-slate-200/80 bg-white/75"
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Local display name</p>
                  <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Customize the label you see in this dashboard without changing stored backend data.</p>
                </div>
                <button
                  onClick={() => setRenameMode((current) => !current)}
                  className={`rounded-full border px-3 py-2 text-sm font-semibold ${
                    isDark ? "border-white/10 bg-white/8 text-slate-100" : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {renameMode ? "Cancel" : "Rename"}
                </button>
              </div>

              <AnimatePresence initial={false}>
                {renameMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-4 flex flex-col gap-3 sm:flex-row"
                  >
                    <input
                      value={renameDraft}
                      onChange={(event) => setRenameDraft(event.target.value)}
                      className={`min-w-0 flex-1 rounded-2xl border px-4 py-3 text-sm outline-none ${
                        isDark ? "border-white/10 bg-slate-900/80 text-slate-100" : "border-slate-200 bg-white text-slate-700"
                      }`}
                    />
                    <button onClick={onRenameSave} className={gradientButtonClass}>
                      <span className="relative z-10">Save alias</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <QuickAction label="Preview" icon={<Eye size={15} />} onClick={() => window.open(previewUrl, "_blank", "noopener,noreferrer")} isDark={isDark} />
              <QuickAction label="Download" icon={<Download size={15} />} onClick={() => onDownload(record)} isDark={isDark} />
              <QuickAction label="Share" icon={<Share2 size={15} />} onClick={() => onShare(record)} isDark={isDark} />
              <QuickAction
                label={record.isImportant ? "Unstar" : "Important"}
                icon={<Star size={15} className={record.isImportant ? "fill-current" : ""} />}
                onClick={() => onToggleImportant(record)}
                isDark={isDark}
              />
              <QuickAction label="Delete" icon={<Trash2 size={15} />} onClick={() => onDelete(record.id)} isDark={isDark} tone="danger" />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {record.tags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    isDark ? "border-white/10 bg-white/8 text-slate-300" : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function InfoPanel({ title, value, isDark }) {
  return (
    <div className={`rounded-[24px] border p-4 ${
      isDark ? "border-white/8 bg-white/6" : "border-slate-200/80 bg-white/75"
    }`}>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{title}</p>
      <p className={`mt-2 text-sm font-medium ${isDark ? "text-slate-100" : "text-slate-700"}`}>{value}</p>
    </div>
  );
}

function MobileFiltersDrawer({
  isDark,
  typeFilter,
  dateFilter,
  tagFilter,
  sortBy,
  setTypeFilter,
  setDateFilter,
  setTagFilter,
  setSortBy,
  availableTags,
  onClose,
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm lg:hidden"
      />
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        className={`fixed inset-x-3 bottom-3 z-[60] rounded-[32px] border p-5 lg:hidden ${
          isDark
            ? "border-white/10 bg-slate-950/94 text-slate-100"
            : "border-white/45 bg-white/94 text-slate-800"
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Filters & sort</h3>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Refine your records on mobile.</p>
          </div>
          <button
            onClick={onClose}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${
              isDark ? "border-white/10 bg-white/8" : "border-slate-200 bg-white"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-3">
          <FilterSelect
            isDark={isDark}
            label="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "all", label: "All types" },
              { value: "pdf", label: "PDF" },
              { value: "image", label: "Images" },
              { value: "prescription", label: "Prescriptions" },
              { value: "report", label: "Reports" },
              { value: "scan", label: "Scans" },
            ]}
          />
          <FilterSelect
            isDark={isDark}
            label="Date"
            value={dateFilter}
            onChange={setDateFilter}
            options={[
              { value: "all", label: "Any time" },
              { value: "30d", label: "Last 30 days" },
              { value: "90d", label: "Last 90 days" },
              { value: "year", label: "This year" },
              { value: "older", label: "Older" },
            ]}
          />
          <FilterSelect
            isDark={isDark}
            label="Tag"
            value={tagFilter}
            onChange={setTagFilter}
            options={[{ value: "all", label: "All tags" }, ...availableTags.map((tag) => ({ value: tag, label: tag }))]}
          />
          <FilterSelect
            isDark={isDark}
            label="Sort"
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
              { value: "name", label: "Name" },
            ]}
          />
        </div>
      </motion.div>
    </>
  );
}

function ToastMessage({ toast, isDark }) {
  const toneStyles = {
    success: isDark ? "border-emerald-400/15 bg-emerald-500/10 text-emerald-100" : "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: isDark ? "border-amber-400/15 bg-amber-500/10 text-amber-100" : "border-amber-200 bg-amber-50 text-amber-700",
    error: isDark ? "border-rose-400/15 bg-rose-500/10 text-rose-100" : "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      className="fixed right-4 top-24 z-[70] w-[min(calc(100%-2rem),22rem)]"
    >
      <div className={`rounded-[24px] border p-4 backdrop-blur-2xl ${toneStyles[toast.tone]}`}>
        <p className="font-semibold">{toast.title}</p>
        <p className="mt-1 text-sm">{toast.message}</p>
      </div>
    </motion.div>
  );
}

function CountUp({ value }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const startTime = performance.now();
    const duration = 650;

    const animate = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayValue(Math.round(progress * value));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [value]);

  return <>{displayValue}</>;
}

function buildRecordMeta(record, customNames, importantIds, sharedIds) {
  const displayName = customNames[record.id] || displayDocumentName(record.file_name);
  const lowerName = displayName.toLowerCase();
  const extension = getExtension(record.file_name);
  const typeFilter = getTypeFilter(lowerName, extension);
  const tags = inferTags(lowerName, extension);
  const isImportant = importantIds.includes(record.id);
  const isShared = sharedIds.includes(record.id);
  const isRecent = matchesDateFilter(record.uploaded_at, "30d");
  const icon = typeFilter === "image" ? <FileImage size={26} /> : <FileText size={26} />;

  const badgeClass = {
    pdf: "border-rose-300/35 bg-rose-500/12 text-rose-600",
    image: "border-emerald-300/35 bg-emerald-500/12 text-emerald-600",
    prescription: "border-violet-300/35 bg-violet-500/12 text-violet-600",
    report: "border-blue-300/35 bg-blue-500/12 text-blue-600",
    scan: "border-cyan-300/35 bg-cyan-500/12 text-cyan-600",
  }[typeFilter] || "border-slate-300/35 bg-slate-500/10 text-slate-600";

  const surfaceGlow = {
    pdf: "bg-[radial-gradient(circle_at_top_left,_rgba(244,63,94,0.08),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.08),_transparent_30%)]",
    image: "bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.08),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.08),_transparent_30%)]",
    prescription: "bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.08),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.08),_transparent_30%)]",
    report: "bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.08),_transparent_30%)]",
    scan: "bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.08),_transparent_30%)]",
  }[typeFilter] || "bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.08),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.08),_transparent_30%)]";

  return {
    displayName,
    extension,
    typeFilter,
    typeLabel: typeFilter === "pdf" ? "PDF file" : typeFilter === "image" ? "Image file" : `${capitalize(typeFilter)} file`,
    categoryLabel: inferCategoryLabel(lowerName, typeFilter),
    tags,
    sizeLabel: formatBytes(record.file_size || record.size || record.content_length) || "Size unavailable",
    sourceLabel: record.source || "Patient upload",
    isImportant,
    isShared,
    isRecent,
    icon,
    badgeClass,
    surfaceGlow,
  };
}

function displayDocumentName(fileName = "") {
  if (!fileName) {
    return "Medical record";
  }

  return fileName.includes("user_") ? fileName.split("_").slice(1).join("_") : fileName;
}

function getExtension(fileName = "") {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
}

function getTypeFilter(lowerName, extension) {
  if (["png", "jpg", "jpeg", "webp"].includes(extension)) {
    return lowerName.includes("xray") || lowerName.includes("scan") ? "scan" : "image";
  }

  if (lowerName.includes("prescription")) {
    return "prescription";
  }

  if (lowerName.includes("report") || lowerName.includes("lab")) {
    return "report";
  }

  if (lowerName.includes("scan") || lowerName.includes("xray")) {
    return "scan";
  }

  if (extension === "pdf") {
    return "pdf";
  }

  return "pdf";
}

function inferCategoryLabel(lowerName, typeFilter) {
  if (lowerName.includes("prescription")) {
    return "Prescription";
  }

  if (lowerName.includes("lab") || lowerName.includes("blood")) {
    return "Lab report";
  }

  if (lowerName.includes("xray") || lowerName.includes("scan")) {
    return "Imaging";
  }

  if (lowerName.includes("certificate")) {
    return "Certificate";
  }

  if (typeFilter === "image") {
    return "Medical image";
  }

  return "Medical document";
}

function inferTags(lowerName, extension) {
  const tags = [];

  if (lowerName.includes("prescription")) {
    tags.push("Prescription");
  }
  if (lowerName.includes("xray") || lowerName.includes("scan")) {
    tags.push("X-ray");
  }
  if (lowerName.includes("lab") || lowerName.includes("blood")) {
    tags.push("Lab Report");
  }
  if (lowerName.includes("certificate")) {
    tags.push("Certificate");
  }
  if (["png", "jpg", "jpeg", "webp"].includes(extension)) {
    tags.push("Image");
  }
  if (extension === "pdf") {
    tags.push("PDF");
  }

  if (tags.length === 0) {
    tags.push("Medical");
  }

  return tags.slice(0, 3);
}

function matchesDateFilter(value, filter) {
  if (filter === "all" || !value) {
    return true;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return filter === "older";
  }

  const now = new Date();
  const diffDays = (now - date) / (1000 * 60 * 60 * 24);

  if (filter === "30d") {
    return diffDays <= 30;
  }
  if (filter === "90d") {
    return diffDays <= 90;
  }
  if (filter === "year") {
    return date.getFullYear() === now.getFullYear();
  }
  if (filter === "older") {
    return diffDays > 365;
  }

  return true;
}

function sortRecords(left, right, sortBy) {
  if (sortBy === "name") {
    return left.displayName.localeCompare(right.displayName);
  }

  const leftTime = new Date(left.uploaded_at || 0).getTime();
  const rightTime = new Date(right.uploaded_at || 0).getTime();

  if (sortBy === "oldest") {
    return leftTime - rightTime;
  }

  return rightTime - leftTime;
}

function formatShortDate(value) {
  if (!value) {
    return "Recently added";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently added";
  }

  return parsedDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeLabel(value) {
  if (!value) {
    return "just now";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "just now";
  }

  const diffMinutes = Math.round((Date.now() - date.getTime()) / (1000 * 60));
  if (diffMinutes < 1) {
    return "just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }
  if (diffMinutes < 1440) {
    return `${Math.round(diffMinutes / 60)} hr ago`;
  }

  return formatShortDate(value);
}

function formatBytes(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "";
  }

  if (numericValue < 1024) {
    return `${numericValue} B`;
  }
  if (numericValue < 1024 * 1024) {
    return `${(numericValue / 1024).toFixed(1)} KB`;
  }

  return `${(numericValue / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFilterLabel(value) {
  if (value === "30d") {
    return "Last 30 days";
  }
  if (value === "90d") {
    return "Last 90 days";
  }
  if (value === "year") {
    return "This year";
  }

  return capitalize(value);
}

function capitalize(value = "") {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default HealthRecordsScreen;
