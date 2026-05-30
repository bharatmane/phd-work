import type { NavLink } from "../types";

export const navLinks: NavLink[] = [
  { label: "Home", to: "/" },
  { label: "Methodology", to: "/methodology" },
  { label: "Papers", to: "/papers" },
  { label: "Thesis Integration", to: "/thesis-integration" },
  { label: "The Story", to: "/thesis-story" },
  { label: "Publications", to: "/publications" },
  { label: "About", to: "/about" },
];

export const researcherProfile = {
  name: "Bharat Babaso Mane",
  department: "Alliance School of Advance Computing",
  university: "Alliance University, Bengaluru",
  supervisor: "Dr. Rathnakar Achary",
  contact: "bharat.mane@gmail.com",
  interests: [
    "Program comprehension",
    "Identifier readability",
    "Software quality metrics",
    "Explainable AI for source code",
    "Machine learning for software engineering",
  ],
};
