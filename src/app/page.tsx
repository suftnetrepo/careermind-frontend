import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  CreditCard,
  Crown,
  Database,
  FileText,
  HeartPulse,
  Lightbulb,
  Laptop,
  Megaphone,
  Mic,
  Pause,
  Play,
  Quote,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Settings,
  TrendingUp,
  Users,
  Volume2,
  WandSparkles,
} from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Pick your role",
    description:
      "Choose a role or paste the actual job description you are applying for.",
  },
  {
    icon: WandSparkles,
    title: "Generate your interview",
    description:
      "Get focused questions tailored to your experience, role and seniority.",
  },
  {
    icon: Mic,
    title: "Practise by voice",
    description:
      "Answer naturally while your AI coach listens, follows up and guides you.",
  },
];

const features = [
  {
    icon: Mic,
    iconClass: "bg-violet-100 text-violet-600",
    title: "Real-time voice AI",
    description:
      "A natural interview conversation, with thoughtful follow-up questions based on your answers.",
  },
  {
    icon: FileText,
    iconClass: "bg-emerald-100 text-emerald-600",
    title: "Use any job description",
    description:
      "Paste a vacancy and CareerMind turns its requirements into realistic, relevant questions.",
  },
  {
    icon: BarChart3,
    iconClass: "bg-sky-100 text-sky-600",
    title: "Live feedback and scoring",
    description:
      "See where your answers are strong and receive practical guidance while you practise.",
  },
  {
    icon: Lightbulb,
    iconClass: "bg-amber-100 text-amber-600",
    title: "Actionable coaching",
    description:
      "Turn broad feedback into clear next steps you can use in your next interview.",
  },
  {
    icon: ShieldCheck,
    iconClass: "bg-indigo-100 text-indigo-600",
    title: "Private practice space",
    description:
      "Build confidence at your own pace in a calm environment designed for focused preparation.",
  },
  {
    icon: BriefcaseBusiness,
    iconClass: "bg-rose-100 text-rose-600",
    title: "Built around your role",
    description:
      "Prepare for behavioural, leadership and role-specific questions instead of generic scripts.",
  },
];

function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 text-[20px] font-extrabold tracking-[-0.04em] ${inverted ? "text-white" : "text-slate-950"}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_8px_20px_rgba(99,102,241,.25)]">
        <Mic className="h-[18px] w-[18px]" strokeWidth={2.5} />
      </span>
      <span>
        Career
        <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
          Mind
        </span>
      </span>
    </span>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[690px] lg:ml-auto">
      <div className="absolute -left-8 top-16 h-56 w-56 rounded-full bg-violet-300/25 blur-2xl" />
      <div className="absolute -right-8 bottom-4 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="absolute -top-12 right-20 z-20 hidden h-16 w-16 items-center justify-center rounded-full border border-white bg-white text-violet-600 shadow-xl sm:flex">
        <Lightbulb className="h-7 w-7" />
      </div>
      <div className="relative z-10 rounded-[30px] border border-white/80 bg-white/80 p-3 shadow-[0_32px_90px_rgba(82,82,180,.16)] backdrop-blur-xl sm:p-5">
        <div className="mb-4 flex items-center justify-between px-1">
          <Brand />
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            00:42
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
          <div className="relative min-h-[340px] overflow-hidden rounded-[23px] bg-slate-200 sm:min-h-[390px]">
            <Image
              src="/images/interview-candidate.png"
              alt="Candidate practising an interview with CareerMind"
              fill
              priority
              sizes="(max-width: 640px) 100vw, 470px"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-5 flex justify-center gap-3">
              <button
                aria-label="Pause interview"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/75 text-white backdrop-blur"
              >
                <Pause className="h-4 w-4" fill="currentColor" />
              </button>
              <button
                aria-label="Mute microphone"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-950/20"
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                aria-label="Audio settings"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/75 text-white backdrop-blur"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Live feedback
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700">
                  On track
                </span>
              </div>
              <ul className="space-y-3 text-[11px] font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Clear
                  structure
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Strong
                  example
                </li>
                <li className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" /> Add a
                  measurable result
                </li>
              </ul>
            </div>
            <div className="flex-1 rounded-[20px] bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600">
                <Volume2 className="h-3.5 w-3.5" /> Next question
              </div>
              <p className="text-sm font-semibold leading-6 text-slate-800">
                How do you handle conflicting priorities?
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -left-5 top-[38%] z-20 hidden max-w-[210px] rounded-2xl border border-white bg-white/95 p-4 shadow-xl backdrop-blur md:block">
        <div className="flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Volume2 className="h-4 w-4" />
          </span>
          <p className="text-xs font-semibold leading-5 text-slate-700">
            Tell me about a time you solved a complex problem.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="overflow-hidden bg-white text-slate-950">
      <div className="relative bg-[radial-gradient(circle_at_82%_22%,rgba(199,210,254,.46),transparent_27%),radial-gradient(circle_at_7%_58%,rgba(224,231,255,.55),transparent_24%),linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)]">
        <header className="relative z-50 px-5 sm:px-8">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between">
            <Link href="/" aria-label="CareerMind home">
              <Brand />
            </Link>
            <nav
              className="hidden items-center gap-8 text-sm font-semibold text-slate-600 lg:flex"
              aria-label="Main navigation"
            >
              <a href="#features" className="transition hover:text-indigo-600">
                Features
              </a>
              <a
                href="#how-it-works"
                className="transition hover:text-indigo-600"
              >
                How it works
              </a>
              <a href="#roles" className="transition hover:text-indigo-600">
                Roles
              </a>
              <a href="#pricing" className="transition hover:text-indigo-600">
                Pricing
              </a>
              <a href="#stories" className="transition hover:text-indigo-600">
                Testimonials
              </a>
            </nav>
            <div className="flex items-center gap-5">
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="hidden min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-indigo-950 sm:inline-flex"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <section className="relative px-5 pb-16 pt-12 sm:px-8 sm:pt-20 lg:pb-24 lg:pt-24">
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[.88fr_1.12fr]">
            <div className="relative z-20">
             
              <h1 className="max-w-2xl text-[clamp(3rem,6.3vw,5.5rem)] font-extrabold leading-[.98] tracking-[-0.065em] text-slate-950">
                Practice interviews.
                <br />
                <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                  Land the job.
                </span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
                CareerMind creates a tailored interview for any role or job
                description, then coaches you live with a natural voice AI.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-slate-950 px-7 text-base font-bold text-white shadow-xl shadow-indigo-950/15 transition hover:-translate-y-0.5 hover:bg-indigo-950"
                >
                  Start free <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-7 text-base font-bold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/50"
                >
                  <Play className="h-4 w-4 fill-slate-800" /> See how it works
                </a>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                <div className="flex -space-x-2" aria-hidden="true">
                  {[
                    "bg-amber-200",
                    "bg-rose-200",
                    "bg-sky-200",
                    "bg-emerald-200",
                  ].map((color, i) => (
                    <span
                      key={color}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white ${color} text-xs font-bold text-slate-700`}
                    >
                      {["AM", "JD", "SK", "LR"][i]}
                    </span>
                  ))}
                </div>
                <div>
                  <div
                    className="flex gap-0.5 text-amber-400"
                    aria-label="Five star rating"
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="mt-1 block text-xs">
                    Join candidates building interview confidence
                  </span>
                </div>
              </div>
            </div>
            <HeroPreview />
          </div>
        </section>

        <section
          className="px-5 pb-14 sm:px-8 lg:pb-20"
          aria-label="Product highlights"
        >
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[26px] border border-slate-100 bg-white/90 shadow-[0_20px_55px_rgba(30,41,59,.07)] backdrop-blur md:grid-cols-4">
            {[
              {
                icon: Users,
                title: "Role-specific",
                text: "Tailored practice",
              },
              {
                icon: BriefcaseBusiness,
                title: "Any role",
                text: "Use a job description",
              },
              {
                icon: BarChart3,
                title: "Instant feedback",
                text: "Actionable coaching",
              },
              {
                icon: ShieldCheck,
                title: "Private by design",
                text: "Practise with confidence",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="flex items-center gap-4 border-b border-slate-100 px-6 py-6 last:border-0 md:border-b-0 md:border-r md:last:border-r-0 lg:px-8"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${["bg-violet-100 text-violet-600", "bg-emerald-100 text-emerald-600", "bg-amber-100 text-amber-600", "bg-sky-100 text-sky-600"][i]}`}
                >
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-extrabold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section
        id="how-it-works"
        className="scroll-mt-20 px-5 py-20 sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl">
              Three steps, then you&apos;re interviewing
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-500">
              From job description to realistic practice in just a few minutes.
            </p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="group relative rounded-[24px] border border-slate-200 bg-white p-7 shadow-[0_14px_36px_rgba(30,41,59,.05)] transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
              >
                <span className="absolute right-6 top-6 text-5xl font-black text-slate-100">
                  0{i + 1}
                </span>
                <span className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-600">
                  <step.icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-20 bg-slate-50/70 px-5 py-20 sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">
                Features
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                Built for the real interview
              </h2>
              <p className="mt-4 text-lg text-slate-500">
                Everything you need to prepare, practise and improve.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              Try every feature <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[24px] border border-slate-200/80 bg-white p-7 shadow-[0_12px_30px_rgba(30,41,59,.04)]"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.iconClass}`}
                >
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 text-lg font-extrabold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:py-28">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-indigo-100/80 bg-[radial-gradient(circle_at_100%_0%,rgba(196,181,253,.2),transparent_28%),radial-gradient(circle_at_0%_100%,rgba(191,219,254,.24),transparent_30%),#fff] px-7 py-10 shadow-[0_24px_70px_rgba(79,70,229,.08)] sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <div className="relative grid items-center gap-10 lg:grid-cols-[.92fr_1.08fr] lg:gap-12">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">
                Practise for your opportunity
              </p>
              <h2 className="mt-4 text-3xl font-extrabold leading-[1.08] tracking-[-0.05em] text-slate-950 sm:text-5xl">
                One coach. Every role <span className="bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">you&apos;re aiming for.</span>
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                Bring the job description and CareerMind adapts the interview to
                the skills, language and expectations that matter.
              </p>
              <Link
                href="/register"
                className="mt-8 inline-flex min-h-14 items-center gap-3 rounded-xl bg-slate-950 px-7 text-base font-extrabold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-indigo-950"
              >
                Build my interview <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Software engineering", icon: Laptop, color: "bg-blue-50 text-blue-500" },
                { label: "Product management", icon: BarChart3, color: "bg-violet-50 text-violet-600" },
                { label: "Data & AI", icon: Database, color: "bg-emerald-50 text-emerald-500" },
                { label: "Sales", icon: TrendingUp, color: "bg-pink-50 text-pink-500" },
                { label: "Healthcare", icon: HeartPulse, color: "bg-cyan-50 text-cyan-500" },
                { label: "Operations", icon: Settings, color: "bg-amber-50 text-amber-500" },
                { label: "Finance", icon: CreditCard, color: "bg-violet-50 text-violet-600" },
                { label: "Marketing", icon: Megaphone, color: "bg-pink-50 text-pink-500" },
                { label: "Leadership", icon: Users, color: "bg-blue-50 text-blue-500" },
              ].map((role) => (
                <div
                  key={role.label}
                  className="flex min-h-[76px] items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/85 px-4 shadow-[0_4px_16px_rgba(30,41,59,.03)] transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:px-5"
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${role.color}`}>
                    <role.icon className="h-6 w-6" strokeWidth={2.2} />
                  </span>
                  <span className="text-sm leading-5 text-slate-800 sm:text-base">
                    {role.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="stories"
        className="scroll-mt-20 bg-indigo-50/50 px-5 py-20 sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-5xl text-center">
          <Quote className="mx-auto h-10 w-10 text-indigo-300" />
          <blockquote className="mt-7 text-2xl font-bold leading-tight tracking-[-0.03em] text-slate-900 sm:text-4xl">
            “The best preparation feels like the real conversation—not another
            script to memorise.”
          </blockquote>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-500">
            CareerMind gives every candidate a focused place to practise out
            loud, reflect and improve before the interview matters.
          </p>
        </div>
      </section>

      <section
        id="pricing"
        className="relative scroll-mt-20 overflow-hidden bg-[radial-gradient(circle_at_8%_45%,rgba(191,219,254,.28),transparent_26%),radial-gradient(circle_at_92%_75%,rgba(196,181,253,.28),transparent_25%),#f8faff] px-5 py-20 sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">
              Pricing
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-6xl">
              Pay per{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                session
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Choose your duration. Pay once. No subscription and no expiry.
            </p>
            <div className="mx-auto mt-6 inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              <span className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2 text-xs font-extrabold text-white">
                Pay per session
              </span>
              <span className="px-6 py-2 text-xs font-bold text-slate-400">
                No recurring fees
              </span>
            </div>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                min: 15,
                price: "£4.99",
                label: "Quick practice",
                description: "Warm up before a real interview",
                icon: Sparkles,
                iconClass: "bg-violet-100 text-violet-600",
                features: [
                  "2–3 interview questions",
                  "Instant voice feedback",
                  "Great for a quick warm-up",
                ],
              },
              {
                min: 30,
                price: "£8.99",
                label: "Standard",
                description: "6–8 questions, most popular",
                icon: Crown,
                iconClass: "bg-white/10 text-amber-300",
                popular: true,
                features: [
                  "Real interview experience",
                  "Detailed feedback report",
                  "Covers key topics and skills",
                ],
              },
              {
                min: 45,
                price: "£13.99",
                label: "Deep dive",
                description: "Technical, behavioural and design",
                icon: Rocket,
                iconClass: "bg-sky-100 text-sky-600",
                features: [
                  "10–12 interview questions",
                  "In-depth feedback and tips",
                  "Ideal for technical roles",
                ],
              },
              {
                min: 60,
                price: "£19.99",
                label: "Full interview",
                description: "Complete interview simulation",
                icon: BriefcaseBusiness,
                iconClass: "bg-emerald-100 text-emerald-600",
                features: [
                  "Full interview experience",
                  "Comprehensive feedback",
                  "Best for final preparation",
                ],
              },
            ].map((plan) => (
              <article
                key={plan.min}
                className={`relative flex min-h-[500px] flex-col rounded-[28px] border p-7 transition hover:-translate-y-1 ${plan.popular ? "border-indigo-500 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 text-white shadow-[0_25px_65px_rgba(79,70,229,.3)] xl:-translate-y-2 xl:hover:-translate-y-3" : "border-slate-200 bg-white text-slate-950 shadow-[0_18px_45px_rgba(30,41,59,.06)] hover:border-indigo-200 hover:shadow-xl"}`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-xs font-extrabold text-white shadow-lg">
                    Most popular
                  </span>
                )}
                <span
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${plan.iconClass}`}
                >
                  <plan.icon className="h-7 w-7" />
                </span>
                <div className="mt-6 text-center">
                  <p
                    className={`text-sm font-bold ${plan.popular ? "text-indigo-200" : "text-slate-500"}`}
                  >
                    {plan.min} minutes
                  </p>
                  <p className="mt-2 text-5xl font-black tracking-[-.05em]">
                    {plan.price}
                  </p>
                  <p
                    className={`mt-3 text-base font-extrabold ${plan.popular ? "text-white" : "text-indigo-600"}`}
                  >
                    {plan.label}
                  </p>
                  <p
                    className={`mt-2 text-sm leading-6 ${plan.popular ? "text-indigo-200" : "text-slate-500"}`}
                  >
                    {plan.description}
                  </p>
                </div>
                <ul className="mt-7 space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex items-start gap-3 text-sm font-semibold ${plan.popular ? "text-indigo-50" : "text-slate-600"}`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${plan.popular ? "bg-white text-indigo-700" : "bg-indigo-600 text-white"}`}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-auto flex min-h-14 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition ${plan.popular ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg" : "border border-slate-200 bg-white text-slate-900 hover:border-indigo-300 hover:text-indigo-600"}`}
                >
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-10 flex items-center justify-center gap-2 text-center text-sm font-semibold text-slate-500">
            <CreditCard className="h-4 w-4" />
            Pay once per session · No subscription · First interview free
          </p>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 lg:pb-28">
        <div className="relative mx-auto grid max-w-7xl items-center gap-7 overflow-hidden rounded-[32px] border border-white bg-[radial-gradient(ellipse_at_12%_50%,rgba(196,181,253,.28),transparent_35%),radial-gradient(ellipse_at_92%_50%,rgba(199,210,254,.38),transparent_35%),linear-gradient(110deg,#faf9ff_0%,#fff_50%,#f4f5ff_100%)] px-6 py-8 shadow-[0_24px_70px_rgba(79,70,229,.1)] sm:px-10 sm:py-10 lg:grid-cols-[.85fr_1.2fr_.9fr] lg:gap-8 lg:px-12 lg:py-6">
          <div className="relative mx-auto flex h-44 w-full max-w-[270px] items-center justify-center sm:h-52 lg:h-56">
            <div className="absolute h-40 w-40 rounded-full bg-violet-200/60 blur-2xl" />
            <div className="absolute left-2 top-7 z-10 flex h-[72px] w-[86px] items-center justify-center rounded-[24px] rounded-bl-md bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
              <span className="flex flex-col gap-2">
                <span className="h-1.5 w-12 rounded-full bg-white/90" />
                <span className="h-1.5 w-12 rounded-full bg-white/90" />
                <span className="h-1.5 w-9 rounded-full bg-white/90" />
              </span>
            </div>
            <div className="absolute bottom-7 right-2 z-10 flex h-12 w-14 items-center justify-center rounded-2xl rounded-br-sm bg-violet-100 text-violet-600 shadow-md">
              <span className="flex gap-1"><span className="h-2 w-2 rounded-full bg-current" /><span className="h-2 w-2 rounded-full bg-current" /><span className="h-2 w-2 rounded-full bg-current" /></span>
            </div>
            <div className="relative z-20 flex h-36 w-36 items-center justify-center rounded-full border-[9px] border-white bg-gradient-to-br from-violet-100 via-white to-indigo-100 text-indigo-800 shadow-[0_16px_40px_rgba(79,70,229,.2)]">
              <span className="absolute -left-4 top-9 h-12 w-4 rounded-l-full bg-gradient-to-b from-violet-500 to-indigo-600" />
              <span className="absolute -right-4 top-9 h-12 w-4 rounded-r-full bg-gradient-to-b from-violet-500 to-indigo-600" />
              <Bot className="h-[76px] w-[76px]" strokeWidth={1.7} />
            </div>
            <Sparkles className="absolute right-8 top-2 h-7 w-7 fill-violet-500 text-violet-600" />
            <Sparkles className="absolute bottom-1 left-14 h-5 w-5 fill-indigo-400 text-indigo-500" />
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold tracking-[-0.045em] text-slate-950 sm:text-4xl">
              Ready to start practising?
            </h2>
            <p className="mt-3 text-base text-slate-500 sm:text-lg">
              Your first interview is free — 10 minutes, no card needed.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex min-h-14 w-full max-w-[360px] items-center justify-center gap-3 rounded-xl bg-slate-950 px-7 font-extrabold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-indigo-950"
            >
              Get started free <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <ul className="mx-auto grid w-full max-w-sm gap-4 text-sm font-semibold text-slate-700 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: "Real voice conversations", icon: Check, color: "bg-emerald-500" },
              { label: "Instant feedback & scoring", icon: BarChart3, color: "bg-indigo-500" },
              { label: "Build confidence", icon: Star, color: "bg-amber-500" },
            ].map((benefit) => (
              <li key={benefit.label} className="flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${benefit.color}`}>
                  <benefit.icon className="h-5 w-5" strokeWidth={2.5} />
                </span>
                {benefit.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="bg-slate-950 px-5 py-12 text-slate-400 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Brand inverted />
            <p className="mt-3 text-sm">
              AI interview practice designed to build real confidence.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/login" className="hover:text-white">
              Log in
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs">
          © 2026 CareerMind · Suftnet Ltd
        </div>
      </footer>
    </main>
  );
}
