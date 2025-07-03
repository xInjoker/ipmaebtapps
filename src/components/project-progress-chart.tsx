'use client';

import { PieChart, Pie, Cell } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

type ProjectProgressChartProps = {
    progress: number;
};

export function ProjectProgressChart({ progress }: ProjectProgressChartProps) {
    const progressData = [
        { name: 'Completed', value: progress, color: 'hsl(var(--primary))' },
        { name: 'Remaining', value: 100 - progress, color: 'hsl(var(--secondary))' },
    ];

    return (
        <div className="relative flex h-[160px] w-[160px] items-center justify-center">
            <ChartContainer config={{}} className="absolute inset-0">
                <PieChart>
                    <Pie
                        data={progressData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={75}
                        startAngle={90}
                        endAngle={450}
                        strokeWidth={0}
                    >
                        {progressData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
            <div className="flex flex-col items-center">
                <span className="text-3xl font-bold font-headline">{progress}%</span>
                <span className="text-sm text-muted-foreground">Completed</span>
            </div>
        </div>
    );
}
