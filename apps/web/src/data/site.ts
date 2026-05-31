import type { NavLink } from "../types";

export const navLinks: NavLink[] = [
  { label: "Home",        to: "/" },
  { label: "Methodology", to: "/methodology" },
  { label: "Papers",      to: "/papers" },
  { label: "Live Demo",   to: "/demo" },
  { label: "The Story",   to: "/thesis-story" },
  { label: "Publications",to: "/publications" },
  { label: "About",       to: "/about" },
  { label: "Synopsis",    to: "/synopsis" },
  { label: "Thesis",      to: "/thesis" },
];

export const researcherProfile = {
  name: "Bharat Babaso Mane",
  department: "Alliance School of Advance Computing",
  university: "Alliance University, Bengaluru",
  supervisor: "Dr. Rathnakar Achary",
  contact: "bharat.mane@gmail.com",
  education: [
    {
      degree: "Doctor of Philosophy (PhD) — in progress",
      field: "Program Comprehension and Explainable AI",
      institution: "Alliance University, Bengaluru",
    },
    {
      degree: "Master of Science (MS)",
      field: "Computer Science",
      institution: "Illinois Institute of Technology, Chicago, USA",
    },
    {
      degree: "Master of Computer Applications (MCA)",
      field: "Computer Applications",
      institution: "Shivaji University, Kolhapur",
    },
    {
      degree: "Bachelor of Science (BSc)",
      field: "Mathematics",
      institution: "Shivaji University, Kolhapur",
    },
  ],
  interests: [
    "Program comprehension",
    "Identifier readability",
    "Software quality metrics",
    "Explainable AI for source code",
    "Machine learning for software engineering",
  ],
};
