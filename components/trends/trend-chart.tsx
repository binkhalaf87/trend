"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendHistoryPoint } from "@/lib/trends/helpers";

export function TrendChart({ data }: { data: TrendHistoryPoint[] }) {
  const forecast = data.filter((point) => point.forecast);
  const firstForecastLabel = forecast[0]?.label;
  const chartData = data.map((point) => ({
    ...point,
    actualSignal: point.forecast ? null : point.signalStrength,
    forecastSignal: point.forecast ? point.signalStrength : null,
  }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.18)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
            minTickGap={18}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
            width={34}
          />
          <Tooltip
            cursor={{ stroke: "rgba(83,74,183,0.18)", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid rgba(83,74,183,0.12)",
              boxShadow: "0 16px 40px rgba(15,23,42,0.10)",
              background: "rgba(255,255,255,0.96)",
            }}
            formatter={(value) => {
              const numericValue = Array.isArray(value)
                ? Number(value[0] ?? 0)
                : typeof value === "number"
                  ? value
                  : Number(value ?? 0);

              return [`${Number.isFinite(numericValue) ? numericValue : 0}%`, "قوة الإشارة"];
            }}
            labelFormatter={(label) => `التاريخ: ${label}`}
          />

          {firstForecastLabel ? (
            <ReferenceArea
              x1={firstForecastLabel}
              x2={data.at(-1)?.label}
              fill="rgba(83,74,183,0.06)"
              strokeOpacity={0}
            />
          ) : null}

          <Line
            type="monotone"
            dataKey="actualSignal"
            stroke="#534AB7"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, fill: "#534AB7" }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="forecastSignal"
            stroke="#8C84F2"
            strokeWidth={3}
            strokeDasharray="6 6"
            dot={false}
            activeDot={{ r: 5, fill: "#8C84F2" }}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
