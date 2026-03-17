"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface Party {
  id: string;
  abbreviation: string;
  color: string;
}

interface PollTrendChartProps {
  data: Record<string, string | number>[];
  parties: Party[];
}

export default function PollTrendChart({ data, parties }: PollTrendChartProps) {
  // Only show parties with data
  const visibleParties = parties.filter((p) =>
    data.some((d) => typeof d[p.id] === "number" && (d[p.id] as number) > 0)
  );

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            {visibleParties.map((party) => (
              <linearGradient key={party.id} id={`gradient-${party.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={party.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={party.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} />
          <YAxis
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            tickFormatter={(v: number) => `${v}%`}
            domain={[0, "auto"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "12px",
              fontSize: "13px",
            }}
            formatter={(value, name) => {
              const party = parties.find((p) => p.id === name);
              return [`${Number(value).toFixed(1)}%`, party?.abbreviation ?? String(name)];
            }}
          />
          <ReferenceLine
            y={5}
            stroke="#ef4444"
            strokeDasharray="6 3"
            strokeOpacity={0.5}
            label={{ value: "5% prah", position: "right", fill: "#ef4444", fontSize: 11 }}
          />
          {visibleParties.map((party) => (
            <Area
              key={party.id}
              type="monotone"
              dataKey={party.id}
              stroke={party.color}
              strokeWidth={2}
              fill={`url(#gradient-${party.id})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
