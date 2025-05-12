
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AnnouncementStatsChartProps {
  data: any[];
}

export const AnnouncementStatsChart: React.FC<AnnouncementStatsChartProps> = ({ data }) => {
  // Process data for the chart
  const chartData = data.map(item => ({
    name: item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title,
    "Read %": item.readPercentage,
    totalRecipients: item.totalRecipients,
    priority: item.priority
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={70} 
          />
          <YAxis 
            label={{ value: 'Read Percentage', angle: -90, position: 'insideLeft' }} 
            domain={[0, 100]} 
          />
          <Tooltip 
            formatter={(value, name) => [
              name === "Read %" ? `${value}%` : value, 
              name === "Read %" ? "Read Percentage" : name
            ]} 
            labelFormatter={(label) => {
              const announcement = data.find(item => 
                item.title.startsWith(label.replace('...', ''))
              );
              return announcement ? announcement.title : label;
            }}
          />
          <Legend />
          <Bar 
            dataKey="Read %" 
            fill="#8884d8" 
            name="Read Percentage" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
