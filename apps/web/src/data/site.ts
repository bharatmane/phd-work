import type { NavLink } from "../types";

export const navLinks: NavLink[] = [
  { label: "Home",        to: "/" },
  { label: "The Story",   to: "/thesis-story" },
  { label: "Papers",      to: "/papers" },
  { label: "Live Demo",   to: "/demo" },
  { label: "Publications",to: "/publications" },
  {
    label: "Documents",
    to: "/synopsis",
    children: [
      { label: "Synopsis",  to: "/synopsis" },
      { label: "Thesis",    to: "/thesis" },
      { label: "Viva Prep", to: "/viva-prep" },
    ],
  },
  { label: "About",       to: "/about" },
];

export const researcherProfile = {
  name: "Bharat Babaso Mane",
  department: "Alliance School of Advance Computing",
  university: "Alliance University, Bengaluru",
  supervisor: "Dr. Rathnakar Achary",
  contact: "bharat.mane@gmail.com",
  photo: "/bharat-caricature.jpeg",
  socialLinks: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/bharatmane/" },
    { label: "GitHub", url: "https://github.com/bharatmane/" },
    { label: "Medium", url: "https://bharatmane.medium.com/" },
    { label: "Website", url: "https://www.bharatmane.com/" },
  ],
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
