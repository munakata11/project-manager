import { useEffect, useState } from "react";
import mermaid from "mermaid";

interface Process {
  id: string;
  title: string;
  duration_days: number;
  dependencies?: Array<{
    depends_on_id: string;
    duration_days: number;
  }>;
}

interface ProcessMermaidChartProps {
  processes: Process[];
}

export const ProcessMermaidChart = ({ processes }: ProcessMermaidChartProps) => {
  const [chart, setChart] = useState<string>("");

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
    });

    const generateChart = async () => {
      const nodes = processes.map(p => `    ${p.id}[${p.title}\\n(${p.duration_days}日)]`).join("\n");
      const edges = processes
        .flatMap(p =>
          p.dependencies?.map(d => `    ${d.depends_on_id} --> ${p.id}`)
        )
        .filter(Boolean)
        .join("\n");

      const definition = `
graph LR
${nodes}
${edges}
      `.trim();

      setChart(definition);
    };

    generateChart();
  }, [processes]);

  return (
    <div className="mt-8 p-4 bg-white rounded-lg border border-gray-100">
      <h3 className="text-lg font-medium text-gray-900 mb-4">工程の依存関係図</h3>
      <div className="mermaid">{chart}</div>
    </div>
  );
};