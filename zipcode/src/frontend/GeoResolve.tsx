import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  Globe2,
  History,
  Loader2,
  MapPin,
  Menu,
  Search,
  Server,
  X,
} from "lucide-react";
import {
  analyzeQuery,
  LocationResult,
  LookupResponse,
  LookupStatus,
  lookupLocation,
} from "./locationService";

type Props = { searchData?: unknown };
const examples = [
  "What city is ZIP code 90210?",
  "Zip codes for Belmont Massachusetts",
  "City lookup Belmont MA",
];

function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    ["Product", "#product"],
    ["Examples", "#demo"],
  ];
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <a
          href="#product"
          className="flex items-center gap-2.5 font-display text-lg font-bold text-slate-950"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white">
            <MapPin size={19} />
          </span>{" "}
          GeoResolve
        </a>
        <nav className="hidden gap-8 text-sm font-semibold text-slate-600 md:flex">
          {links.map(([label, href]) => (
            <a key={label} href={href} className="hover:text-blue-600">
              {label}
            </a>
          ))}
        </nav>
        <a
          href="#demo"
          className="hidden rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white md:block"
        >
          Try the demo
        </a>
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          className="rounded-lg p-2 md:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4 text-sm font-semibold">
            {links.map(([label, href]) => (
              <a key={label} href={href}>
                {label}
              </a>
            ))}
            <a
              href="#demo"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-white"
            >
              Try the demo
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
function Hero() {
  return (
    <section id="product" className="overflow-hidden bg-[#f3f8ff]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-32">
        <div>
          <span className="inline-flex rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700">
            HyperDart location component
          </span>
          <h1 className="mt-6 max-w-2xl font-display text-5xl font-bold leading-[1.04] tracking-tight text-slate-950 sm:text-6xl">
            Turn location questions into structured data.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Understand natural-language ZIP and city questions, select the right
            lookup operation, and return developer-ready location data.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#demo"
              className="rounded-lg bg-blue-600 px-5 py-3.5 text-sm font-bold text-white"
            >
              Try the lookup
            </a>
            <a
              href="#demo"
              className="rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700"
            >
              See examples
            </a>
          </div>
          <div className="mt-9 flex flex-wrap gap-5 text-sm font-medium text-slate-500">
            <span>
              <Check className="mr-2 inline text-emerald-500" size={16} />
              Natural language
            </span>
            <span>
              <Check className="mr-2 inline text-emerald-500" size={16} />
              Clear results
            </span>
            <span>
              <Check className="mr-2 inline text-emerald-500" size={16} />
              Fallback ready
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl sm:p-7">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-200">
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-400" />
              Location found
            </span>
            <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-400">
              ● 200 OK
            </span>
          </div>
          <div className="mt-7 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-400">90210</p><h3 className="mt-2 font-display text-2xl font-bold text-white">Beverly Hills</h3><p className="mt-1 text-sm text-slate-400">California, United States</p></div><span className="grid size-12 place-items-center rounded-xl bg-blue-500/15 text-blue-400"><Globe2 size={22} /></span></div>
          <div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-lg bg-white/5 p-3"><p className="text-[10px] font-bold uppercase text-slate-500">Latitude</p><p className="mt-1 text-sm font-semibold text-slate-200">34.0901</p></div><div className="rounded-lg bg-white/5 p-3"><p className="text-[10px] font-bold uppercase text-slate-500">Longitude</p><p className="mt-1 text-sm font-semibold text-slate-200">-118.4065</p></div></div>
        </div>
      </div>
    </section>
  );
}
function Pill({ children, tone }: { children: React.ReactNode; tone: "blue" | "slate" }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone === "blue" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
      {children}
    </span>
  );
}
function Analysis({ analysis }: { analysis: ReturnType<typeof analyzeQuery> }) {
  const rows = [
    ["Original query", analysis.originalQuery || "—"],
    ["Search type", analysis.mode ? `${analysis.mode} search` : "Not detected"],
    ["Country", `${analysis.country || "—"} (${analysis.countryCode || "—"})`],
    ["Postal code", analysis.postalCode || "—"],
    ["State", analysis.stateCode || analysis.state || "—"],
    ["City", analysis.city || "—"],
  ];
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <h3 className="border-b border-slate-200 p-5 font-display font-bold">
        Search summary
      </h3>
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid gap-1 border-b border-slate-100 px-5 py-3 text-sm sm:grid-cols-[145px_1fr]"
        >
          <span className="text-slate-400">{label}</span>
          <span
            className={`break-all font-medium ${label === "Selected endpoint" ? "font-mono text-xs text-blue-700" : "text-slate-700"}`}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
function Result({
  response,
  copy,
}: {
  response: LookupResponse;
  copy: (text: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            {response.source === "live"
              ? "Live API"
              : response.source === "demo"
                ? "Demo data"
                : "Offline fallback"}
          </span>
          <h3 className="mt-3 font-display text-xl font-bold">
            {response.results.length} location result
            {response.results.length === 1 ? "" : "s"}
          </h3>
        </div>
        <button
          onClick={() => copy(JSON.stringify(response.results, null, 2))}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold hover:border-blue-300"
        >
          <Copy size={14} />
          Copy JSON
        </button>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-155 text-left text-sm">
          <thead className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="pb-3">City</th>
              <th className="pb-3">State</th>
              <th className="pb-3">Postal code</th>
              <th className="pb-3">Country</th>
              <th className="pb-3">Coordinates</th>
            </tr>
          </thead>
          <tbody>
            {response.results.map((item: LocationResult, index) => (
              <tr
                key={`${item.postalCode}-${index}`}
                className="border-b border-slate-100"
              >
                <td className="py-3 font-semibold">
                  {item.city || item.place || "—"}
                </td>
                <td className="py-3">
                  {item.state || "—"} {item.stateCode && `(${item.stateCode})`}
                </td>
                <td className="py-3 font-mono text-xs">
                  {item.postalCode || "—"}
                </td>
                <td className="py-3">
                  {item.country || "—"}{" "}
                  {item.countryCode && `(${item.countryCode})`}
                </td>
                <td className="py-3 font-mono text-xs">
                  {item.latitude}, {item.longitude}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function Playground({ searchData }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LookupStatus>("idle");
  const [response, setResponse] = useState<LookupResponse | null>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"demo" | "live" | "fallback">("demo");
  const [history, setHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("georesolve-history") || "[]");
    } catch {
      return [];
    }
  });
  const analysis = useMemo(
    () => analyzeQuery(searchData, query),
    [searchData, query],
  );
  useEffect(() => {
    const initial = analyzeQuery(searchData);
    if (initial.originalQuery) setQuery(initial.originalQuery);
  }, [searchData]);
  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    setError("");
    setResponse(null);
    const next = analyzeQuery(undefined, query);
    if (
      !next.mode ||
      (next.mode === "city" && (!next.city || !next.stateCode))
    ) {
      setStatus("error");
      setError(
        "Please include a postal code, or provide both a city and state.",
      );
      return;
    }
    setStatus("loading");
    try {
      const result = await lookupLocation(
        {
          mode: next.mode,
          country: next.countryCode || "US",
          postalCode: next.postalCode,
          city: next.city,
          state: next.stateCode,
        },
        mode,
      );
      if (!result.results.length)
        throw new Error("No location was found. Try one of the examples.");
      setResponse(result);
      setStatus("success");
      const updated = [
        query,
        ...history.filter((item) => item.toLowerCase() !== query.toLowerCase()),
      ].slice(0, 5);
      setHistory(updated);
      localStorage.setItem("georesolve-history", JSON.stringify(updated));
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "The lookup failed.");
    }
  };
  const useExample = (item: string) => {
    setQuery(item);
    setResponse(null);
    setError("");
    setStatus("idle");
  };
  const copy = async (text: string) => {
    await navigator.clipboard?.writeText(text);
    setError("Copied");
    setTimeout(() => setError(""), 1200);
  };
  return (
    <section id="demo" className="bg-[#f8fbff] px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">
          Interactive playground
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Find a place in seconds.
        </h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <form onSubmit={submit}>
              <label htmlFor="query" className="text-sm font-bold">
                Natural-language lookup
              </label>
              <div className="mt-3 flex gap-2 rounded-lg border border-slate-300 p-1.5 focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try “What city is ZIP code 90210?”"
                  className="min-w-0 flex-1 px-3 py-2 text-sm outline-none"
                />
                <button
                  disabled={status === "loading"}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {status === "loading" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                  {status === "loading" ? "Looking up…" : "Resolve"}
                </button>
              </div>
            </form>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="py-1.5 font-semibold text-slate-400">
                Examples
              </span>
              {examples.map((item) => (
                <button
                  key={item}
                  onClick={() => useExample(item)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600"
                >
                  {item}
                </button>
              ))}
            </div>
            {history.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs">
                <History size={14} className="text-slate-400" />
                {history.map((item) => (
                  <button
                    key={item}
                    onClick={() => useExample(item)}
                    className="underline decoration-dotted"
                  >
                    {item}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem("georesolve-history");
                  }}
                  className="ml-auto text-slate-400 hover:text-red-600"
                >
                  Clear history
                </button>
              </div>
            )}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-slate-500">
                Search type
              </span>
              <Pill tone={analysis.mode ? "blue" : "slate"}>
                {analysis.mode
                  ? `${analysis.mode} lookup`
                  : "Waiting for query"}
              </Pill>
            </div>
            {error && (
              <div
                role="alert"
                className={`mt-5 flex gap-2 rounded-lg border p-4 text-sm font-medium ${error === "Copied" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}
              >
                <AlertCircle size={17} />
                {error}
              </div>
            )}
            {response && (
              <div className="mt-5">
                <Result response={response} copy={copy} />
              </div>
            )}
            {!error && !response && status !== "loading" && (
              <div className="mt-5 flex min-h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-400">
                Enter a question to see a normalized location result.
              </div>
            )}
            <div className="mt-5 flex items-center justify-between rounded-lg bg-blue-50 p-3">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Server size={15} className="text-blue-600" /> Search source
              </span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as typeof mode)}
                className="rounded-md border border-blue-200 bg-white px-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="demo">Demo data</option>
                <option value="live">Live API</option>
                <option value="fallback">Offline fallback</option>
              </select>
            </div>
          </div>
          <div className="space-y-5">
            <Analysis analysis={analysis} />
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-slate-600 shadow-sm">
              <h3 className="font-display font-bold text-slate-900">What you can search</h3>
              <p className="mt-2">Enter a ZIP code, ask which city it belongs to, or search for postal codes in a city and state.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
function App({ searchData }: Props) {
    const [chatMessages, setChatMessages] = useState([
      { from: "bot", text: "Hi! Ask me about ZIP codes, cities, states, or coordinates." },
    ]);
    const [chatInput, setChatInput] = useState("");
    const [chatBusy, setChatBusy] = useState(false);
    const askChatbot = async (question: string) => {
      if (chatBusy) return;
      setChatBusy(true);
      setChatMessages((messages) => [...messages, { from: "user", text: question }]);
      const lower = question.toLowerCase();
      const analysis = analyzeQuery(undefined, question);
      let answer = lower.includes("country")
        ? "The demo currently includes United States locations and is structured for more countries."
        : lower.includes("coordinate")
          ? "Every location result includes latitude and longitude. Try asking about 90210."
          : "Try asking “What city is ZIP code 90210?” or “Zip codes for Belmont Massachusetts”.";
      if (analysis.mode && (analysis.postalCode || analysis.city)) {
        try {
          const result = await lookupLocation({ mode: analysis.mode, country: analysis.countryCode || "US", postalCode: analysis.postalCode, city: analysis.city, state: analysis.stateCode }, "demo");
          answer = result.results.length
            ? `${result.results.map((item) => `${item.city} (${item.postalCode})`).join(", ")} · ${result.results[0].state}, ${result.results[0].country}. Coordinates: ${result.results[0].latitude}, ${result.results[0].longitude}.`
            : "I couldn't find that location in the demo data. Try 90210, 10001, or Belmont Massachusetts.";
        } catch (error) {
          answer = error instanceof Error ? error.message : "I couldn't find that location. Try one of the examples.";
        }
      }
      setChatMessages((messages) => [...messages, { from: "bot", text: answer }]);
      setChatInput("")
      setChatBusy(false);
    }
    return (
      <>
        <Header />
        <Hero />
        <Playground searchData={searchData} />
        <section
          id="pricing"
          className="bg-blue-600 px-5 py-16 text-center text-white"
        >
          <h2 className="font-display text-3xl font-bold">
            Find the right place faster.
          </h2>
          <p className="mt-4 text-blue-100">
            Search a ZIP code or city whenever you need a quick, clear answer.
          </p>
          <a
            href="#demo"
            className="mt-7 inline-flex rounded-lg bg-white px-5 py-3.5 text-sm font-bold text-blue-700"
          >
            Try another lookup
          </a>
        </section>
        <section className="bg-white px-5 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-display text-3xl font-bold">Ask GeoResolve</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">Need help choosing what to search? Ask a quick question.</p>
            <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fbff] shadow-sm">
              <div className="max-h-72 space-y-3 overflow-y-auto p-5" aria-live="polite">
                {chatMessages.map((message, index) => <div key={`${message.from}-${index}`} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.from === "user" ? "rounded-br-md bg-blue-600 text-white" : "rounded-bl-md bg-white text-slate-600 shadow-sm"}`}>{message.text}</div></div>)}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-slate-200 p-4">{["What can I search?", "What data do I get?", "Do you show coordinates?"].map((question) => <button key={question} onClick={() => askChatbot(question)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600">{question}</button>)}</div>
              <form onSubmit={(event) => { event.preventDefault(); if (chatInput.trim()) void askChatbot(chatInput.trim()) }} className="flex gap-2 border-t border-slate-200 bg-white p-4"><label htmlFor="chat-input" className="sr-only">Ask GeoResolve a question</label><input id="chat-input" value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask about a lookup..." className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" /><button disabled={chatBusy} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{chatBusy ? "..." : "Send"}</button></form>
            </div>
          </div>
        </section>
        <footer className="bg-slate-950 px-5 py-12 text-slate-400">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-8">
            <div>
              <p className="font-display text-lg font-bold text-white">
                GeoResolve
              </p>
              <p className="mt-3 text-sm">
                Built for fast, simple location resolution.
              </p>
              <p className="mt-3 text-xs">Postal-code data © GeoNames</p>
            </div>
            <div className="flex gap-8 text-sm">
              <a href="#product">Product</a>
              <a href="#demo">Examples</a>
              <a href="https://github.com/AnshAghi/HyperSprint">GitHub</a>
            </div>
          </div>
        </footer>
      </>
    );
  };
export default App;
