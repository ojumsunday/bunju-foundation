export type OnboardingRole = "freelancer" | "founder" | "company" | "investor";

export type InterviewQuestion = {
  fieldKey: string;
  question: string;
  hint: string;
  /** 2 or 3 — step 1 is always role selection. */
  step: 2 | 3;
};

export const ROLE_OPTIONS: { role: OnboardingRole; label: string; blurb: string }[] = [
  { role: "freelancer", label: "Freelancer / Job seeker", blurb: "You do the work and want it verified." },
  { role: "founder", label: "Founder", blurb: "You're building a company and need people or capital." },
  { role: "company", label: "Company / Employer", blurb: "You hire proven talent for a team." },
  { role: "investor", label: "Investor", blurb: "You back founders on evidence, not pitch decks." },
];

export const STEP_LABELS: Record<1 | 2 | 3, string> = {
  1: "Choose your role",
  2: "Tell us about your work",
  3: "Preferences and logistics",
};

export const QUESTION_SETS: Record<OnboardingRole, InterviewQuestion[]> = {
  freelancer: [
    { fieldKey: "specialization", question: "What's your specialization?", hint: "A broad label like \"developer\" or \"designer\" is too vague — the discipline should be clear.", step: 2 },
    { fieldKey: "core_skills", question: "Which core skills do you want to be found for?", hint: "Expect at least two concrete skills, tools, or languages.", step: 2 },
    { fieldKey: "years_experience", question: "How many years have you been doing this professionally?", hint: "A number or clear range is enough.", step: 2 },
    { fieldKey: "work_wanted", question: "What kind of job or project are you looking for right now?", hint: "Should describe the type of work, not just \"anything\".", step: 2 },
    { fieldKey: "availability", question: "What's your availability?", hint: "Full-time, part-time, hours per week, or a start date.", step: 3 },
    { fieldKey: "expected_compensation", question: "What compensation are you expecting?", hint: "A rate, salary range, or currency-anchored number.", step: 3 },
    { fieldKey: "work_preference", question: "Do you prefer remote, hybrid, or on-site work?", hint: "One of remote / hybrid / on-site, optionally with location.", step: 3 },
  ],
  founder: [
    { fieldKey: "pitch", question: "Give me your one-line pitch — what are you building?", hint: "Should say what it does and for whom.", step: 2 },
    { fieldKey: "industry", question: "Which industry or market is that in?", hint: "A specific sector, not \"tech\".", step: 2 },
    { fieldKey: "stage", question: "What stage are you at?", hint: "Idea, prototype, first users, revenue, or a funding round.", step: 3 },
    { fieldKey: "needs", question: "What do you need most right now?", hint: "Hiring, capital, co-founder, distribution — should be actionable.", step: 3 },
  ],
  company: [
    { fieldKey: "industry", question: "What industry is your company in?", hint: "A specific sector, not \"tech\".", step: 2 },
    { fieldKey: "company_size", question: "How many people work there?", hint: "A number or range.", step: 2 },
    { fieldKey: "roles_hiring", question: "Which roles are you hiring for?", hint: "Named roles, not \"various positions\".", step: 3 },
    { fieldKey: "hiring_urgency", question: "How urgent is that hiring?", hint: "A timeframe such as immediately, this quarter, or ongoing.", step: 3 },
  ],
  investor: [
    { fieldKey: "investment_type", question: "What type of investing do you do?", hint: "Angel, VC fund, syndicate, debt, and so on.", step: 2 },
    { fieldKey: "industries", question: "Which industries do you invest in?", hint: "At least one specific sector.", step: 2 },
    { fieldKey: "preferred_stage", question: "What stage do you prefer to come in at?", hint: "Pre-seed, seed, Series A, growth, and so on.", step: 3 },
    { fieldKey: "ticket_size", question: "What's your typical ticket size?", hint: "An amount or range with a currency.", step: 3 },
    { fieldKey: "geography", question: "Which regions or geographies do you cover?", hint: "Countries, regions, or \"global\".", step: 3 },
  ],
};

export function questionAt(role: OnboardingRole, index: number): InterviewQuestion | undefined {
  return QUESTION_SETS[role][index];
}
