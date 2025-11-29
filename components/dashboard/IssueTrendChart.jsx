// components/dashboard/IssueTrendChart.jsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function IssueTrendChart({ data }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="created" stroke="#3B82F6" strokeWidth={2} name="Created" />
          <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} name="Completed" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

