'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { AcademicTermRow } from '@/types/domain.types';
import { EmptyStateCard } from '@/components/shared/empty-state-card';
import { formatGpa } from '@/lib/utils';

export interface GpaTrendChartProps {
  terms: AcademicTermRow[];
  studentId: string;
  cumulativeGpa?: number | null;
}

interface ChartDataPoint {
  termLabel: string;
  unweighted: number | null;
  weighted: number | null;
}

export function GpaTrendChart({ terms, cumulativeGpa }: GpaTrendChartProps) {
  if (!terms || terms.length === 0) {
    return (
      <EmptyStateCard
        title="No Academic History"
        description="No academic term or GPA records found. Upload the Gradelink transcript PDF to start tracking GPA progression."
        actionLabel="Upload Transcript PDF"
        actionHref="/transcript-upload"
        icon={TrendingUp}
      />
    );
  }

  const chartData: ChartDataPoint[] = terms.map((term) => ({
    termLabel: `${term.academic_year.slice(2)} ${term.semester.replace('Semester ', 'S')}`,
    unweighted: term.term_gpa_unweighted ? Number(term.term_gpa_unweighted) : null,
    weighted: term.term_gpa_weighted ? Number(term.term_gpa_weighted) : null,
  }));

  const latestTerm = terms[terms.length - 1];
  const displayGpa = cumulativeGpa ?? latestTerm?.term_gpa_weighted;

  return (
    <div className="bg-white border border-[#E5E5E3] rounded-md p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F1F1F0]">
        <div>
          <h3 className="text-sm font-semibold text-[#37352F] flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#2383E2]" />
            GPA Progression Trend
          </h3>
          <p className="text-xs text-[#787774] mt-0.5">
            Semester-by-semester Weighted vs Unweighted GPA
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-[11px] text-[#787774] font-medium uppercase tracking-wider">
              Cumulative Weighted
            </span>
            <span className="text-base font-bold text-[#37352F]">
              {formatGpa(displayGpa)}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F0" vertical={false} />
            <XAxis
              dataKey="termLabel"
              tick={{ fontSize: 11, fill: '#787774' }}
              axisLine={{ stroke: '#E5E5E3' }}
              tickLine={false}
            />
            <YAxis
              domain={[2.0, 5.0]}
              ticks={[2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]}
              tick={{ fontSize: 11, fill: '#787774' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E5E3',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                fontSize: '12px',
                color: '#37352F',
              }}
              formatter={(value: unknown, name: unknown) => [
                typeof value === 'number' ? value.toFixed(2) : 'N/A',
                name === 'weighted'
                  ? 'Weighted GPA'
                  : name === 'unweighted'
                  ? 'Unweighted GPA'
                  : 'Cumulative GPA',
              ]}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
            />
            <Line
              type="monotone"
              dataKey="weighted"
              name="Weighted"
              stroke="#2383E2"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#2383E2' }}
              activeDot={{ r: 6 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="unweighted"
              name="Unweighted"
              stroke="#787774"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#787774' }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
