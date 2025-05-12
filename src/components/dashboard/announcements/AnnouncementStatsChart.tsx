
import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AnnouncementData } from "@/types/announcements";

interface AnnouncementStatsChartProps {
  data: AnnouncementData[];
}

export const AnnouncementStatsChart: React.FC<AnnouncementStatsChartProps> = ({ data }) => {
  // Format data for the chart
  const chartData = data.map((item) => {
    const acknowledgementRate = item.requires_acknowledgment && item.acknowledged_count !== null 
      ? Math.round((item.acknowledged_count / item.total_users) * 100) 
      : null;
    
    return {
      name: item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title,
      read: Math.round((item.read_count / item.total_users) * 100),
      acknowledged: acknowledgementRate,
      fullTitle: item.title,
    };
  }).slice(0, 10); // Limit to 10 items for better visualization
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          height={70}
        />
        <YAxis 
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]}
        />
        <Tooltip 
          formatter={(value) => [`${value}%`]}
          labelFormatter={(label, data) => data[0]?.payload?.fullTitle || label}
        />
        <Bar dataKey="read" fill="#8884d8" name="Read Rate" />
        <Bar dataKey="acknowledged" fill="#82ca9d" name="Acknowledged Rate" />
      </BarChart>
    </ResponsiveContainer>
  );
};
