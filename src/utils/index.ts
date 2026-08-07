import { Problem } from "../types";

export const getYoutubeId = (url: string) => {
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};

export const exportProblemsCSV = (problems: Problem[]) => {
  const headers = ["Problem ID", "Title", "Organization", "Department", "Theme", "Category", "Dataset Links", "YouTube Links"];
  const rows = problems.map(p => [p.id, p.title, p.organization, p.department, p.theme, p.category, p.datasetLinks, p.youtubeLinks]
    .map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "sih-2025-problems.csv";
  a.click();
};
