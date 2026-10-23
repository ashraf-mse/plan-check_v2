import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analyze PostgreSQL EXPLAIN Plans | PlanCheck",
  description: "Paste PostgreSQL EXPLAIN ANALYZE output in text or JSON format. Get evidence-based diagnostics for scans, row estimates, joins, memory, triggers, JIT and more.",
  alternates: { canonical: "https://plancheck.dev/analyze" },
};

export default function AnalyzerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
