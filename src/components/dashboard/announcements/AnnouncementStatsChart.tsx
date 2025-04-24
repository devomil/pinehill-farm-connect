
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { AnnouncementData } from "@/types/announcements";

interface AnnouncementStatsChartProps {
  data: AnnouncementData[];
}

export const AnnouncementStatsChart = ({ data }: AnnouncementStatsChartProps) => {
  return (
    <ChartContainer
      config={{
        read: { label: "Read", theme: { light: "#0ea5e9", dark: "#38bdf8" } },
        acknowledged: { label: "Acknowledged", theme: { light: "#22c55e", dark: "#4ade80" } },
        total: { label: "Total Users", theme: { light: "#94a3b8", dark: "#64748b" } }
      }}
      className="h-[250px]"
    >
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <XAxis 
            dataKey="title" 
            angle={-45}
            textAnchor="end"
            height={70}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip />
          <Bar 
            dataKey="read_count" 
            name="Read" 
            fill="var(--color-read)"
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            dataKey="acknowledged_count" 
            name="Acknowledged" 
            fill="var(--color-acknowledged)"
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            dataKey="total_users" 
            name="Total Users" 
            fill="var(--color-total)"
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
