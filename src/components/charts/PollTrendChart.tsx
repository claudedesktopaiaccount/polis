"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
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
  const visibleParties = parties.filter((p) =>
    data.some((d) => typeof d[p.id] === "number" && (d[p.id] as number) > 0)
  );

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--text)" }}
            tickLine={{ stroke: "var(--divider)" }}
            axisLine={{ stroke: "var(--divider)" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--text)" }}
            tickFormatter={(v: number) => `${v}%`}
            domain={[0, "auto"]}
            tickLine={{ stroke: "var(--divider)" }}
            axisLine={{ stroke: "var(--divider)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--ink)",
              borderRadius: "0",
              padding: "12px",
              fontSize: "13px",
              color: "var(--text)",
            }}
            formatter={(value, name) => {
              const party = parties.find((p) => p.id === name);
              return [`${Number(value).toFixed(1)}%`, party?.abbreviation ?? String(name)];
            }}
            labelStyle={{ fontWeight: 600, color: "var(--ink)" }}
          />
          <Legend
            formatter={(value) => {
              const party = parties.find((p) => p.id === value);
              return party?.abbreviation ?? value;
            }}
            wrapperStyle={{ fontSize: "12px", color: "var(--text)" }}
          />
          <ReferenceLine
            y={5}
            stroke="var(--text)"
            strokeDasharray="6 3"
            strokeOpacity={0.4}
            label={{ value: "5%", position: "right", fill: "var(--text)", fontSize: 11 }}
          />
          {visibleParties.map((party) => (
            <Line
              key={party.id}
              type="monotone"
              dataKey={party.id}
              stroke={party.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
