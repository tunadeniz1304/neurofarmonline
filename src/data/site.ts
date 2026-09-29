/**
 * Single source of truth for site facts.
 * Every number and claim here must come from NeuroFarm's own material —
 * never add metrics, customers, partners or quotes that aren't verified.
 */

export const site = {
  name: 'NeuroFarm',
  tagline: 'The offline brain for agriculture.',
  url: 'https://neurofarm.nl',
  title: 'NeuroFarm — The offline brain for agriculture',
  description:
    'NeuroFarm is closed-loop crop control powered by a single spiking neural network, trained with reinforcement learning and running on neuromorphic edge hardware next to the plant. No cloud. No hand-written rules.',
  email: 'info@neurofarm.nl',
  domain: 'neurofarm.nl',
  location: 'Amsterdam, Netherlands',
  base: 'VU Amsterdam Demonstrator Lab',
  formAction: 'https://formspree.io/f/mjgapvpo',
} as const;

export const nav = [
  { href: '#problem', label: 'Problem' },
  { href: '#system', label: 'How it works' },
  { href: '#rigour', label: 'Rigour' },
  { href: '#roadmap', label: 'Roadmap' },
  { href: '#market', label: 'Market' },
  { href: '#team', label: 'Team' },
] as const;

export const heroSpecs = [
  { label: 'Sensors → actuators', value: '5 → 3' },
  { label: 'Decisions / day', value: '288' },
  { label: 'Parameters', value: '7,259' },
  { label: 'Power budget', value: '< 1 W', note: 'design target' },
] as const;

export const problems = [
  {
    title: 'Control that can’t adapt',
    body: 'Hand-tuned thresholds, fixed LED schedules and PID loops keep control conservative. They don’t learn from the crop in front of them.',
  },
  {
    title: 'A rising footprint',
    body: 'Indoor and vertical farming carry a rising water and energy footprint for every kilogram of produce.',
  },
  {
    title: 'Cloud AI, bolted on top',
    body: 'Most “AI in agriculture” runs in the cloud, on top of those same rules — adding latency, bandwidth and energy cost, and failing where connectivity is poor: rural sites and open fields.',
  },
] as const;

export const controlToday = ['Sensors', 'Internet uplink', 'Cloud model', 'Thresholds · PID · timers', 'Actuators'] as const;

export const pipeline = [
  {
    step: 'Simulate',
    body: 'A scientific lettuce-growth digital twin (Van Henten model) plus a climate model. 47 crop parameters, each traced to a peer-reviewed source.',
  },
  { step: 'Learn', body: 'A reinforcement-learning agent (Soft Actor-Critic) learns the control policy inside the twin.' },
  { step: 'Distil', body: 'The policy is distilled into a tiny network: 5 → 32 → 16 → 3.' },
  { step: 'Quantise', body: 'Quantised to 8/4/4-bit so the whole policy fits in on-chip memory.' },
  {
    step: 'Deploy',
    body: 'Converted into a spiking neural network running on a BrainChip Akida AKD1000 — right next to the plant.',
  },
] as const;

export const networkProfile = [
  { value: '7,259', label: 'parameters' },
  { value: '8,760', label: 'MACs per decision' },
  { value: '~50%', label: 'activation sparsity' },
  { value: '8/4/4', label: 'bit quantisation' },
  { value: '5·32·16·3', label: 'layer widths' },
  { value: 'On-chip', label: 'whole policy in on-chip memory' },
] as const;

/** `long` is used in body copy, `chart` / `short` label the Fig. 1 canvas (wide / narrow). */
export const sensors = [
  { long: 'Soil moisture', chart: 'Soil moisture', short: 'Moisture' },
  { long: 'Air temperature / humidity', chart: 'Air temp / RH', short: 'Air T / RH' },
  { long: 'Light (PPFD)', chart: 'Light · PPFD', short: 'PPFD' },
  { long: 'CO₂', chart: 'CO₂', short: 'CO₂' },
  { long: 'Soil electrical conductivity (EC)', chart: 'Soil EC', short: 'Soil EC' },
] as const;

export const actuators = [
  { long: 'Irrigation pump', chart: 'Irrigation pump', short: 'Pump' },
  { long: 'LED intensity', chart: 'LED intensity', short: 'LED' },
  { long: 'Nutrient dosing pump', chart: 'Nutrient dosing', short: 'Dosing' },
] as const;

export const edgeNode = 'Akida AKD1000 + Raspberry Pi 5 + inline power metering.';

export const scenarios = [
  { id: 'nominal', label: 'Nominal' },
  { id: 'drought', label: 'Drought' },
  { id: 'over', label: 'Over-irrigation' },
  { id: 'co2', label: 'CO₂ drop' },
] as const;

export type ScenarioId = (typeof scenarios)[number]['id'];

export const preRegistration = [
  { label: 'Date', value: '10 May 2026' },
  { label: 'Hypotheses', value: '9' },
  { label: 'Benchmark data', value: 'None existed yet' },
  { label: 'Baselines', value: 'PID · rule-based · timer schedules' },
  { label: 'Statistics', value: 'Wilcoxon · Cliff’s δ · Holm–Bonferroni' },
] as const;

export const rigourStats = [
  { value: '9', label: 'pre-registered hypotheses' },
  { value: '210', label: 'benchmark runs' },
  { value: '20', label: 'seeds per headline comparison' },
  { value: '366', label: 'automated tests' },
  { value: '25+', label: 'architecture decision records' },
  { value: 'v0.1.0', label: 'research release, May 2026' },
] as const;

export type MilestoneState = 'done' | 'now' | 'later';

export const roadmap: ReadonlyArray<{
  when: string;
  title: string;
  body: string;
  state: MilestoneState;
  badge?: string;
}> = [
  {
    when: 'Oct 2025 – Jun 2026',
    title: 'Phase 0',
    badge: 'Complete',
    body: 'Digital twin, full RL → SNN toolchain, pre-registered benchmark protocol.',
    state: 'done',
  },
  {
    when: 'Feb 2026',
    title: 'Accepted into VU D-Lab',
    body: 'The VU Amsterdam Demonstrator Lab, a European deep-tech program.',
    state: 'done',
  },
  {
    when: '2026 · We are here',
    title: 'Phase 1',
    badge: 'In progress',
    body: 'Running on real neuromorphic hardware at VU D-Lab. Silicon-level power measurement. Peer-reviewed publication.',
    state: 'now',
  },
  {
    when: 'Next',
    title: 'Phase 1.5',
    body: 'A camera with spiking vision on the same chip: disease detection, biomass estimation, visual feedback into control.',
    state: 'later',
  },
  {
    when: '2027+',
    title: 'Phase 2',
    body: 'Multiple crops and cultivars, field pilots with partners, LED-spectrum control.',
    state: 'later',
  },
];

export const vision = ['Vertical farm', 'Greenhouse', 'Open field', 'Space agriculture'] as const;

export const marketPath = [
  { title: 'Indoor & vertical farms', body: 'Our beachhead.' },
  { title: 'Commercial greenhouses', body: 'An alternative to rule-based climate computers.' },
  { title: 'Open field', body: 'Where working offline matters most.' },
] as const;

export const markets = ['Precision agriculture', 'Edge AI hardware', 'Neuromorphic computing'] as const;

export const tailwinds = [
  'EU Green Deal pressure on water, fertiliser and energy use',
  'Food security in climate-stressed regions',
  'Falling cost of neuromorphic and edge AI chips',
  'Strong European focus on deep-tech AgriTech',
] as const;

export const team = [
  {
    name: 'Tuna Deniz',
    role: 'Co-Founder & Technical Lead',
    focus: 'Spiking neural networks, neuromorphic hardware, reinforcement learning, edge computing.',
    linkedin: 'https://linkedin.com/in/tuna-deniz1304',
    photo: 'tuna-deniz',
    tone: 'accent',
  },
  {
    name: 'Cihan Ozturk',
    role: 'Co-Founder & Business Lead',
    focus: 'Strategy, operations, European market expansion.',
    linkedin: 'https://www.linkedin.com/in/cihanozturk0/',
    photo: 'cihan-ozturk',
    tone: 'amber',
  },
] as const;

export const interestTypes = [
  { value: 'Investor', label: 'Investor — request the brief' },
  { value: 'Pilot partner', label: 'Pilot partner (greenhouse / vertical farm)' },
  { value: 'Research partner', label: 'Research partner' },
  { value: 'Other', label: 'Other' },
] as const;
