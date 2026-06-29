export type P3Sample = {
  job: "SSE" | "SE" | "SA" | "NSE" | "BOT" | "UNKNOW";
  jobLabel: string;
  followers: number;
  NoC: number;
  CE: number;
  NCE: number;
  AddLOC: number;
  DelLOC: number;
  churnLOC: number;
  NoMGM: number;
  DiP: number;
  ICT: number;
  project: string;
};

const JOB_LABELS: Record<P3Sample["job"], string> = {
  SSE: "Experienced Software Engineer (ESE)",
  SE: "Software Engineer (SE)",
  SA: "Software Architect (SA)",
  NSE: "Non-Software Engineer (NSE)",
  BOT: "Bot (BOT)",
  UNKNOW: "Unknown (UNK)",
};

// Real developer records from Perez, Urtado & Vauttier (2023), "Dataset of Open-Source
// Software Developers Labeled by Their Experience Level" — Zenodo record 7011334.
// This is the actual dataset EESQA-DELMOA was trained/evaluated on (703 profiles, 6 classes).
// `job` is the dataset's ground-truth label — not live SSNN model output (the trained
// BAHB+SSNN+AMBOA classifier isn't deployed here). Usernames are anonymized in the source data.
export const p3Samples: P3Sample[] = [
  { job: "SSE", jobLabel: JOB_LABELS.SSE, followers: 14, NoC: 4094, CE: 386, NCE: 748, AddLOC: 137166, DelLOC: 16472, churnLOC: 120694, NoMGM: 0, DiP: 3543.17, ICT: 1.73, project: "uPortal" },
  { job: "SSE", jobLabel: JOB_LABELS.SSE, followers: 456, NoC: 2898, CE: 10771, NCE: 9766, AddLOC: 1328791, DelLOC: 228558, churnLOC: 1100233, NoMGM: 176, DiP: 3477.68, ICT: 5.85, project: "flowable-engine" },
  { job: "SE", jobLabel: JOB_LABELS.SE, followers: 6, NoC: 685, CE: 0, NCE: 0, AddLOC: 519, DelLOC: 155, churnLOC: 364, NoMGM: 0, DiP: 3252.91, ICT: 17.75, project: "dhis2-core" },
  { job: "SE", jobLabel: JOB_LABELS.SE, followers: 20, NoC: 392, CE: 4, NCE: 4, AddLOC: 4236, DelLOC: 1374, churnLOC: 2862, NoMGM: 0, DiP: 2708.54, ICT: 13.82, project: "uPortal" },
  { job: "SA", jobLabel: JOB_LABELS.SA, followers: 164, NoC: 2330, CE: 701, NCE: 495, AddLOC: 39070, DelLOC: 7437, churnLOC: 31633, NoMGM: 1, DiP: 2809.10, ICT: 1.21, project: "Broadleaf" },
  { job: "SA", jobLabel: JOB_LABELS.SA, followers: 636, NoC: 2019, CE: 3995, NCE: 3576, AddLOC: 553694, DelLOC: 23711, churnLOC: 529983, NoMGM: 28, DiP: 2816.08, ICT: 2.89, project: "flowable-engine" },
  { job: "NSE", jobLabel: JOB_LABELS.NSE, followers: 82, NoC: 3357, CE: 0, NCE: 0, AddLOC: 124, DelLOC: 37, churnLOC: 87, NoMGM: 0, DiP: 4303.58, ICT: 48.98, project: "Broadleaf" },
  { job: "NSE", jobLabel: JOB_LABELS.NSE, followers: 2, NoC: 294, CE: 0, NCE: 0, AddLOC: 0, DelLOC: 0, churnLOC: 0, NoMGM: 0, DiP: 2024.23, ICT: 6.89, project: "Broadleaf" },
  { job: "BOT", jobLabel: JOB_LABELS.BOT, followers: 3, NoC: 696, CE: 0, NCE: 0, AddLOC: 0, DelLOC: 0, churnLOC: 0, NoMGM: 0, DiP: 438.92, ICT: 0.63, project: "Activiti" },
  { job: "BOT", jobLabel: JOB_LABELS.BOT, followers: 3, NoC: 293, CE: 0, NCE: 1, AddLOC: 184, DelLOC: 13, churnLOC: 171, NoMGM: 0, DiP: 487.84, ICT: 1.66, project: "Activiti" },
  { job: "UNKNOW", jobLabel: JOB_LABELS.UNKNOW, followers: 338, NoC: 254, CE: 26, NCE: 50, AddLOC: 4000, DelLOC: 2166, churnLOC: 1834, NoMGM: 0, DiP: 1635.80, ICT: 12.88, project: "ureport" },
  { job: "UNKNOW", jobLabel: JOB_LABELS.UNKNOW, followers: 20, NoC: 130, CE: 12, NCE: 6, AddLOC: 1684, DelLOC: 148, churnLOC: 1536, NoMGM: 0, DiP: 32.30, ICT: 0.5, project: "flowable-engine" },
];
