import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardPlus,
  Copy,
  HeartPulse,
  Info,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Search,
  Share2,
  ShieldAlert,
  Siren,
  UserRound,
} from "lucide-react";

const EMERGENCY_PROFILE_KEY = "sehat-emergency-profile";
const EMERGENCY_CONTACTS_KEY = "sehat-emergency-contacts";

const QUICK_CALLS = [
  {
    id: "national",
    label: "Emergency",
    number: "112",
    description: "National emergency response",
    tone: "red",
  },
  {
    id: "ambulance",
    label: "Ambulance",
    number: "108",
    description: "Medical transport in many states",
    tone: "blue",
  },
  {
    id: "health-helpline",
    label: "Health Line",
    number: "102",
    description: "Government medical assistance",
    tone: "emerald",
  },
];

const QUICK_SEARCHES = ["Emergency hospital near me", "Trauma centre", "24x7 hospital", "ICU hospital"];

const EMERGENCY_GUIDES = [
  {
    id: "breathing",
    title: "Trouble breathing",
    severity: "Call immediately",
    body: "Sit the person upright, loosen tight clothing, and call emergency help right away if breathing is severe, noisy, or worsening.",
  },
  {
    id: "bleeding",
    title: "Heavy bleeding",
    severity: "Direct pressure",
    body: "Press firmly with a clean cloth, keep the injured area raised if possible, and seek urgent help if bleeding does not slow quickly.",
  },
  {
    id: "chest",
    title: "Chest pain",
    severity: "Urgent evaluation",
    body: "If the pain is intense, crushing, spreading to the arm or jaw, or comes with sweating or breathlessness, call emergency services immediately.",
  },
  {
    id: "unconscious",
    title: "Unconscious person",
    severity: "Check response",
    body: "Check for breathing, place them on their side if they are breathing, and call emergency help at once if they are not responsive.",
  },
];

const DEFAULT_CONTACT = { name: "", relation: "", phone: "" };

function EmergencyScreen({ t, user }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [statusMessage, setStatusMessage] = useState("Find nearby emergency hospitals using search or your live location.");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeGuide, setActiveGuide] = useState(EMERGENCY_GUIDES[0].id);
  const [currentLocationLabel, setCurrentLocationLabel] = useState("");
  const [coords, setCoords] = useState(null);
  const [emergencyContact, setEmergencyContact] = useState(DEFAULT_CONTACT);
  const [medicalNotes, setMedicalNotes] = useState("");

  useEffect(() => {
    try {
      const savedContact = JSON.parse(window.localStorage.getItem(EMERGENCY_CONTACTS_KEY) || "null");
      if (savedContact) {
        setEmergencyContact({
          name: savedContact.name || "",
          relation: savedContact.relation || "",
          phone: savedContact.phone || "",
        });
      }
    } catch {
      setEmergencyContact(DEFAULT_CONTACT);
    }

    try {
      const savedProfile = JSON.parse(window.localStorage.getItem(EMERGENCY_PROFILE_KEY) || "null");
      if (savedProfile?.medicalNotes) {
        setMedicalNotes(savedProfile.medicalNotes);
      }
    } catch {
      setMedicalNotes("");
    }

    if (user?.address) {
      setSearchQuery(user.address);
    }
  }, [user?.address]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => setSuccessMessage(""), 3200);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const patientSummary = useMemo(
    () => ({
      fullName: user?.full_name || "Patient",
      phone: user?.mobile || "Not added",
      address: user?.address || "No saved address",
      bloodGroup: user?.blood_group || "Unknown",
      weight: user?.weight ? `${user.weight} kg` : "Not added",
      height: user?.height ? `${user.height} cm` : "Not added",
    }),
    [user]
  );

  const activeGuideItem = EMERGENCY_GUIDES.find((guide) => guide.id === activeGuide) || EMERGENCY_GUIDES[0];

  const fetchHospitals = async (payload) => {
    setIsLoading(true);
    setHospitals([]);
    setStatusMessage("Searching for hospitals...");

    try {
      const response = await fetch("/api/v1/patient/nearby-hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await safeJson(response);
      if (!response.ok) {
        throw new Error(data.error || `An error occurred: ${response.statusText}`);
      }

      if (data.searchedLocation) {
        setSearchQuery(data.searchedLocation);
        setCurrentLocationLabel(data.searchedLocation);
      }

      if (data.hospitals && data.hospitals.length > 0) {
        setHospitals(data.hospitals);
        setStatusMessage("");
      } else {
        setHospitals([]);
        setStatusMessage(`No hospitals found near "${data.searchedLocation || searchQuery}".`);
      }
    } catch (error) {
      setHospitals([]);
      setStatusMessage(`Error: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSearch = () => {
    if (!searchQuery.trim()) {
      setStatusMessage("Enter an area, city, or hospital type to search.");
      return;
    }

    fetchHospitals({ address: searchQuery.trim() });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage("Geolocation is not supported by your browser.");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        fetchHospitals({ latitude, longitude });
      },
      (error) => {
        setIsLoading(false);
        setStatusMessage(`Could not get location: ${error.message}.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const saveEmergencyInfo = () => {
    window.localStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(emergencyContact));
    window.localStorage.setItem(
      EMERGENCY_PROFILE_KEY,
      JSON.stringify({
        medicalNotes,
      })
    );
    setSuccessMessage("Emergency details saved on this device.");
  };

  const shareEmergencySummary = async () => {
    const summary = buildEmergencySummary({
      patientSummary,
      emergencyContact,
      medicalNotes,
      currentLocationLabel,
      coords,
    });

    try {
      if (navigator.share) {
        await navigator.share({
          title: "SehatSahayak Emergency Details",
          text: summary,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(summary);
      }
      setSuccessMessage("Emergency summary is ready to share.");
    } catch {
      setSuccessMessage("Could not share right now.");
    }
  };

  const copyEmergencySummary = async () => {
    const summary = buildEmergencySummary({
      patientSummary,
      emergencyContact,
      medicalNotes,
      currentLocationLabel,
      coords,
    });

    try {
      await navigator.clipboard.writeText(summary);
      setSuccessMessage("Emergency summary copied.");
    } catch {
      setSuccessMessage("Clipboard is unavailable on this device.");
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {successMessage && (
        <div className="sticky top-20 z-20 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 size={18} />
          {successMessage}
        </div>
      )}

      <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 text-white shadow-xl shadow-red-200/50">
        <div className="grid gap-8 px-6 py-8 md:px-8 xl:grid-cols-[1.25fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Siren size={16} />
              Emergency assistance
            </div>
            <h1 className="mt-5 text-3xl font-bold leading-tight md:text-4xl">
              Get urgent help fast and keep the most important details ready.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-red-50 md:text-base">
              Use this emergency hub to call for immediate support, locate nearby hospitals, share your medical snapshot, and keep emergency contact details ready.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {QUICK_CALLS.map((item) => (
                <a
                  key={item.id}
                  href={`tel:${item.number}`}
                  className="rounded-[24px] border border-white/20 bg-white/10 p-4 backdrop-blur transition-colors hover:bg-white/20"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-100">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold">{item.number}</p>
                  <p className="mt-2 text-sm text-red-50">{item.description}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/20 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-100">Patient snapshot</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <HeroStat label="Blood Group" value={patientSummary.bloodGroup} />
                <HeroStat label="Phone" value={patientSummary.phone} />
                <HeroStat label="Address" value={patientSummary.address} compact />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/20 bg-slate-900/20 p-5 backdrop-blur">
              <div className="flex items-start gap-3">
                <ShieldAlert size={20} className="mt-0.5 text-red-100" />
                <div>
                  <p className="font-bold">Call emergency services first in life-threatening situations.</p>
                  <p className="mt-2 text-sm text-red-50">
                    This screen supports emergency action, but it should never delay urgent medical response.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-6">
          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="search"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-slate-700 outline-none transition-all focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Search city, neighbourhood, or hospital area"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleTextSearch()}
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  className="rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700 disabled:bg-blue-300"
                  onClick={handleTextSearch}
                  disabled={isLoading}
                >
                  {isLoading ? "Searching..." : "Search hospitals"}
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
                  onClick={handleUseMyLocation}
                  disabled={isLoading}
                >
                  <LocateFixed size={18} />
                  Locate me
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_SEARCHES.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setSearchQuery(item);
                    fetchHospitals({ address: item });
                  }}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-700"
                >
                  {item}
                </button>
              ))}
              {user?.address && (
                <button
                  onClick={() => {
                    setSearchQuery(user.address);
                    fetchHospitals({ address: user.address });
                  }}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-700"
                >
                  Use saved address
                </button>
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">Nearby care</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Emergency hospitals and ambulance-ready facilities</h2>
              </div>
              {currentLocationLabel && (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {currentLocationLabel}
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              {isLoading ? (
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-500 animate-pulse">
                  {statusMessage}
                </div>
              ) : hospitals.length > 0 ? (
                hospitals.map((hospital) => <HospitalCard key={hospital.id} hospital={hospital} />)
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-500">
                  {statusMessage}
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">Emergency summary</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Shareable medical details</h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <SnapshotRow icon={<UserRound size={16} />} label="Patient" value={patientSummary.fullName} />
              <SnapshotRow icon={<HeartPulse size={16} />} label="Blood Group" value={patientSummary.bloodGroup} />
              <SnapshotRow icon={<Phone size={16} />} label="Mobile" value={patientSummary.phone} />
              <SnapshotRow icon={<MapPin size={16} />} label="Address" value={patientSummary.address} />
            </div>

            <label className="mt-5 block text-sm font-semibold text-slate-700">
              Medical notes
              <textarea
                rows="4"
                value={medicalNotes}
                onChange={(event) => setMedicalNotes(event.target.value)}
                placeholder="Add allergies, chronic conditions, medicines, or anything emergency staff should know."
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={saveEmergencyInfo}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700"
              >
                <ClipboardPlus size={16} />
                Save details
              </button>
              <button
                onClick={copyEmergencySummary}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-700"
              >
                <Copy size={16} />
                Copy summary
              </button>
              <button
                onClick={shareEmergencySummary}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-700"
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">Emergency contact</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Keep one trusted person ready</h2>

            <div className="mt-5 space-y-4">
              <InputField
                label="Full Name"
                value={emergencyContact.name}
                onChange={(value) => setEmergencyContact((current) => ({ ...current, name: value }))}
                placeholder="Who should be called first?"
              />
              <InputField
                label="Relation"
                value={emergencyContact.relation}
                onChange={(value) => setEmergencyContact((current) => ({ ...current, relation: value }))}
                placeholder="Parent, spouse, sibling..."
              />
              <InputField
                label="Phone Number"
                value={emergencyContact.phone}
                onChange={(value) => setEmergencyContact((current) => ({ ...current, phone: value }))}
                placeholder="Contact phone number"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={saveEmergencyInfo}
                className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700"
              >
                Save contact
              </button>
              {emergencyContact.phone && (
                <a
                  href={`tel:${emergencyContact.phone.replace(/[\s-()]/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
                >
                  <Phone size={16} />
                  Call contact
                </a>
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">Quick first aid</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">What to do right now</h2>

            <div className="mt-5 flex flex-wrap gap-2">
              {EMERGENCY_GUIDES.map((guide) => (
                <button
                  key={guide.id}
                  onClick={() => setActiveGuide(guide.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    activeGuide === guide.id
                      ? "bg-red-600 text-white shadow-lg shadow-red-200"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-700"
                  }`}
                >
                  {guide.title}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-[26px] bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="mt-1 text-red-600" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">{activeGuideItem.severity}</p>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">{activeGuideItem.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{activeGuideItem.body}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <div className="flex items-start gap-3">
                <Info size={18} className="mt-0.5 shrink-0" />
                <p>This guidance is for immediate support only and does not replace emergency medical care.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function HospitalCard({ hospital }) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address)}&query_place_id=${hospital.id}`;

  return (
    <div className="rounded-[28px] border border-red-100 bg-white p-5 shadow-sm transition-all hover:shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-slate-800">{hospital.name}</h3>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                hospital.type === "Government"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-blue-200 bg-blue-50 text-blue-700"
              }`}
            >
              {hospital.type}
            </span>
          </div>

          <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
            <MapPin size={14} className="mt-0.5 shrink-0" />
            {hospital.address}
          </p>
        </div>

        {hospital.distanceText && (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
            <p className="text-lg font-bold text-slate-800">{hospital.distanceText}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Distance</p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {hospital.phone ? (
          <a
            href={`tel:${hospital.phone.replace(/[\s-()]/g, "")}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
          >
            <Phone size={16} />
            Call now
          </a>
        ) : (
          <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-400">
            <Phone size={16} />
            Phone unavailable
          </span>
        )}

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700"
        >
          <Navigation size={16} />
          Directions
        </a>
      </div>
    </div>
  );
}

function HeroStat({ label, value, compact = false }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-100">{label}</p>
      <p className={`mt-2 font-bold text-white ${compact ? "text-sm leading-6" : "text-2xl"}`}>{value}</p>
    </div>
  );
}

function SnapshotRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="rounded-xl bg-white p-2 text-slate-500 shadow-sm">{icon}</div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function buildEmergencySummary({ patientSummary, emergencyContact, medicalNotes, currentLocationLabel, coords }) {
  const locationText = currentLocationLabel
    ? currentLocationLabel
    : coords
      ? `${coords.latitude}, ${coords.longitude}`
      : "Location not added";

  return [
    "SehatSahayak Emergency Details",
    `Name: ${patientSummary.fullName}`,
    `Phone: ${patientSummary.phone}`,
    `Blood Group: ${patientSummary.bloodGroup}`,
    `Address: ${patientSummary.address}`,
    `Location: ${locationText}`,
    `Emergency Contact: ${emergencyContact.name || "Not saved"}${emergencyContact.phone ? ` - ${emergencyContact.phone}` : ""}`,
    `Medical Notes: ${medicalNotes || "None added"}`,
  ].join("\n");
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export default EmergencyScreen;
