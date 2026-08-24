import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Database,
  Globe2,
  Menu,
  MapPin,
  Search,
  Server,
  X,
  Zap,
} from "lucide-react";
import { LocationResult, lookupLocation } from "./mockApi";

type LookupMode = "postal" | "city";
type ApiTab = "JavaScript" | "cURL" | "Python";
const examples = ["90210", "10001", "Belmont, MA"];
const responsePreview = `{
  "postalCode": "90210",
  "city": "Beverly Hills",
  "state": "California",
  "country": "United States",
  "latitude": "34.0901",
  "longitude": "-118.4065"
}`;
const apiCode: Record<ApiTab, string> = {
  JavaScript: `const response = await fetch(\n  '/api/lookup/postal/90210'\n);\nconst location = await response.json();`,
  cURL: `curl https://api.zipfinder.dev/\n  /api/lookup/postal/90210`,
  Python: `import requests\n\nlocation = requests.get(\n  'https://api.zipfinder.dev/api/lookup/postal/90210'\n).json()`,
};

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <a
          href="#product"
          className="flex items-center gap-2.5 font-display text-lg font-bold text-slate-950"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <MapPin size={19} />
          </span>{" "}
          ZipFinder
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#product" className="transition hover:text-blue-600">
            Product
          </a>
          <a href="#api" className="transition hover:text-blue-600">
            API Docs
          </a>
          <a href="#examples" className="transition hover:text-blue-600">
            Examples
          </a>
          <a href="#pricing" className="transition hover:text-blue-600">
            Pricing
          </a>
        </nav>
        <div className="hidden items-center gap-5 text-sm font-semibold md:flex">
          <button className="text-slate-600 hover:text-slate-950">
            Sign in
          </button>
          <a
            href="#demo"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Get Started
          </a>
        </div>
        <button
          className="rounded-lg p-2 text-slate-700 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4 text-sm font-semibold text-slate-700">
            <a href="#product" onClick={() => setOpen(false)}>
              Product
            </a>
            <a href="#api" onClick={() => setOpen(false)}>
              API Docs
            </a>
            <a href="#examples" onClick={() => setOpen(false)}>
              Examples
            </a>
            <a href="#pricing" onClick={() => setOpen(false)}>
              Pricing
            </a>
            <a
              href="#demo"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-white"
            >
              Get Started
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

function ApiResponsePreview() {
  return (
    <div className="relative rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl shadow-blue-950/20 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <span className="grid size-7 place-items-center rounded-lg bg-blue-500/15 text-blue-400">
            <Code2 size={15} />
          </span>{" "}
          API response
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400" /> 200 OK
        </span>
      </div>
      <pre className="overflow-x-auto text-[13px] leading-7 text-slate-300">
        <code>{responsePreview}</code>
      </pre>
    </div>
  );
}
function Hero() {
  return (
    <section id="product" className="relative overflow-hidden bg-[#f3f8ff]">
      <div className="absolute -right-32 -top-48 size-135 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:py-28 lg:grid-cols-[1.02fr_.98fr] lg:gap-20 lg:px-8 lg:py-32">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
            <Zap size={13} /> Simple location data for developers
          </span>
          <h1 className="mt-6 max-w-2xl font-display text-5xl font-bold leading-[1.05] tracking-[-.045em] text-slate-950 sm:text-6xl lg:text-7xl">
            Find the place behind every postal code.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Resolve ZIP codes, postal codes, cities, states, coordinates, and
            country information through one simple API.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Try the lookup <ArrowRight size={16} />
            </a>
            <a
              href="#api"
              className="rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
            >
              View API docs
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-2">
              <Check className="text-emerald-500" size={16} /> Fast response
            </span>
            <span className="flex items-center gap-2">
              <Check className="text-emerald-500" size={16} /> Developer
              friendly
            </span>
            <span className="flex items-center gap-2">
              <Check className="text-emerald-500" size={16} /> JSON output
            </span>
          </div>
        </div>
        <ApiResponsePreview />
      </div>
    </section>
  );
}

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}
function LocationResultCard({ result }: { result: LocationResult }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-blue-600">
            Location found
          </p>
          <h3 className="mt-2 font-display text-xl font-bold text-slate-950">
            {result.city}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {result.state} · {result.country}
          </p>
        </div>
        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
          200 OK
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DataCell label="Postal code" value={result.postalCode} />
        <DataCell label="State code" value={result.stateCode || "—"} />
        <DataCell label="Latitude" value={result.latitude} />
        <DataCell label="Longitude" value={result.longitude} />
      </div>
    </div>
  );
}

function LookupDemo() {
  const [mode, setMode] = useState<LookupMode>("postal");
  const [countryCode, setCountryCode] = useState("US");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setResults([]);
    if (mode === "postal" && !postalCode.trim())
      return setError("Enter a postal code to continue.");
    if (mode === "city" && (!city.trim() || !state.trim()))
      return setError("Enter both a city and state to continue.");
    setLoading(true);
    try {
      setResults(
        await lookupLocation(
          mode === "postal"
            ? { mode, countryCode, postalCode: postalCode.trim() }
            : { mode, countryCode, city: city.trim(), state: state.trim() },
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  const useExample = (value: string) => {
    if (value === "Belmont, MA") {
      setMode("city");
      setCity("Belmont");
      setState("MA");
      setPostalCode("");
    } else {
      setMode("postal");
      setPostalCode(value);
      setCity("");
      setState("");
    }
    setError("");
    setResults([]);
  };
  return (
    <section id="demo" className="bg-white px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">
            Live demo
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Try a location lookup
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-slate-500">
            Explore the response shape before connecting your application to the
            production API.
          </p>
        </div>
        <div className="mt-10 rounded-2xl border border-slate-200 bg-[#f8fbff] p-4 shadow-xl shadow-slate-200/40 sm:p-7">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => {
                setMode("postal");
                setError("");
                setResults([]);
              }}
              className={`flex-1 rounded-md px-3 py-2.5 text-sm font-bold transition ${mode === "postal" ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
            >
              ZIP / Postal code
            </button>
            <button
              onClick={() => {
                setMode("city");
                setError("");
                setResults([]);
              }}
              className={`flex-1 rounded-md px-3 py-2.5 text-sm font-bold transition ${mode === "city" ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
            >
              City + State
            </button>
          </div>
          <form onSubmit={submit} className="mt-6">
            <div className="grid gap-4 sm:grid-cols-[150px_1fr_auto]">
              {mode === "postal" ? (
                <>
                  <label className="flex flex-col gap-2 text-xs font-bold text-slate-600">
                    Country
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-12 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none ring-blue-500 focus:ring-2"
                    >
                      <option value="US">United States (US)</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-xs font-bold text-slate-600">
                    Postal code
                    <input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 90210"
                      className="h-12 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
                    />
                  </label>
                </>
              ) : (
                <>
                  <label className="flex flex-col gap-2 text-xs font-bold text-slate-600">
                    Country
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-12 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none ring-blue-500 focus:ring-2"
                    >
                      <option value="US">United States (US)</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-xs font-bold text-slate-600">
                    State
                    <input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. MA"
                      className="h-12 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-xs font-bold text-slate-600">
                    City
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Belmont"
                      className="h-12 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
                    />
                  </label>
                </>
              )}
              <button
                disabled={loading}
                className="mt-auto flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
              >
                <Search size={16} />
                {loading ? "Searching…" : "Search"}
              </button>
            </div>
          </form>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="mr-1 font-semibold">Examples:</span>
            {examples.map((item) => (
              <button
                key={item}
                onClick={() => useExample(item)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
              >
                {item}
              </button>
            ))}
          </div>
          {error && (
            <div
              className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}
          {results.length > 0 && (
            <div className="mt-6 space-y-3">
              {results.map((result) => (
                <LocationResultCard
                  key={`${result.postalCode}-${result.city}`}
                  result={result}
                />
              ))}
            </div>
          )}
          {!error && !loading && results.length === 0 && (
            <div className="mt-6 flex min-h-28 items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-400">
              Enter a value above to see formatted location information.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: MapPin,
    title: "Postal-code lookup",
    text: "Find the city, region, country, and coordinates for a postal code.",
  },
  {
    icon: Database,
    title: "City and state lookup",
    text: "Retrieve postal-code information for a city within a state or region.",
  },
  {
    icon: Code2,
    title: "Developer-friendly JSON",
    text: "Receive predictable JSON that is easy to consume in any frontend or backend.",
  },
  {
    icon: Globe2,
    title: "Global-ready structure",
    text: "Keep the data model ready for country-specific postal formats.",
  },
];
function FeatureGrid() {
  return (
    <section id="examples" className="bg-[#f3f8ff] px-5 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">
            Built for builders
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Location data without the busywork.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="grid size-10 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <Icon size={19} />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-slate-950">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ApiCodePreview() {
  const [tab, setTab] = useState<ApiTab>("JavaScript");
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard?.writeText(apiCode[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <section id="api" className="bg-white px-5 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">
            API preview
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            A clean interface for every stack.
          </h2>
          <p className="mt-5 max-w-md leading-7 text-slate-500">
            One request. Clear location data. No unnecessary geocoding
            complexity.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-slate-900/20">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex gap-1">
              {(Object.keys(apiCode) as ApiTab[]).map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setTab(item);
                    setCopied(false);
                  }}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold ${tab === item ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Copy API example"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="border-b border-white/10 px-5 py-4 font-mono text-xs text-blue-300">
            GET /api/lookup/postal/90210
          </div>
          <pre className="min-h-48 overflow-x-auto p-5 text-xs leading-6 text-slate-300">
            <code>
              {apiCode[tab]}
              {`\n\n`}
              <span className="text-slate-500">// response</span>
              {`\n`}
              {responsePreview}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    "Understand the user query.",
    "Select the correct lookup operation.",
    "Return formatted location information.",
  ];
  return (
    <section className="border-y border-slate-200 bg-[#f8fbff] px-5 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-slate-950">
            Simple by design.
          </h2>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step}>
              <span className="mx-auto grid size-11 place-items-center rounded-full bg-blue-600 font-display font-bold text-white md:mx-0">
                0{index + 1}
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-slate-950">
                {step}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Fast, focused, and ready for your product workflow.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function FAQ() {
  const questions = [
    "What information does a lookup return?",
    "Can I look up a city and state?",
    "Which countries are supported?",
    "Can I use this in my own application?",
    "How do I connect the production API?",
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-white px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-slate-950 sm:text-4xl">
            Questions, answered.
          </h2>
        </div>
        <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
          {questions.map((question, index) => (
            <div key={question}>
              <button
                className="flex w-full items-center justify-between gap-4 py-5 text-left font-semibold text-slate-800"
                onClick={() => setOpen(open === index ? -1 : index)}
                aria-expanded={open === index}
              >
                {question}
                <ChevronDown
                  size={18}
                  className={`shrink-0 transition ${open === index ? "rotate-180 text-blue-600" : "text-slate-400"}`}
                />
              </button>
              {open === index && (
                <p className="-mt-2 pb-5 pr-10 text-sm leading-6 text-slate-500">
                  ZipFinder returns structured location fields through a simple
                  JSON response, making it easy to connect the demo to your own
                  application and backend.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function Footer() {
  return (
    <footer className="bg-slate-950 px-5 py-12 text-slate-400">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 font-display text-lg font-bold text-white">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white">
              <MapPin size={19} />
            </span>{" "}
            ZipFinder
          </div>
          <p className="mt-5 max-w-xs text-sm leading-6">
            Built for fast, simple location lookups.
          </p>
          <p className="mt-4 text-xs text-slate-500">
            Postal-code data © GeoNames
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Product
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <a href="#product" className="hover:text-white">
              Product
            </a>
            <a href="#api" className="hover:text-white">
              Docs
            </a>
            <a href="#examples" className="hover:text-white">
              Examples
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Developer
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <a href="#api" className="hover:text-white">
              API Reference
            </a>
            <a
              href="https://github.com/AnshAghi/HyperSprint"
              className="hover:text-white"
            >
              GitHub
            </a>
            <a href="#status" className="hover:text-white">
              Status
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
function App() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />
      <Hero />
      <LookupDemo />
      <FeatureGrid />
      <ApiCodePreview />
      <HowItWorks />
      <section
        id="pricing"
        className="bg-blue-600 px-5 py-16 text-center text-white"
      >
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Start building with location data.
          </h2>
          <p className="mt-4 text-blue-100">
            Use the demo now and connect your own backend when you are ready.
          </p>
          <a
            href="#api"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3.5 text-sm font-bold text-blue-700 shadow-xl transition hover:bg-blue-50"
          >
            Explore the API <ArrowRight size={16} />
          </a>
        </div>
      </section>
      <FAQ />
      <Footer />
    </div>
  );
}
export default App;
