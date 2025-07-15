
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DashboardWidgetProps = {
  title: string;
  value?: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  shapeColor: string;
};

export function DashboardWidget({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  shapeColor,
}: DashboardWidgetProps) {
  return (
    <Card className="relative overflow-hidden">
      <svg
        className={`absolute -top-1 -right-1 h-24 w-24 ${shapeColor}`}
        fill="currentColor"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M62.3,-53.5C78.2,-41.5,86.8,-20.8,86.4,-0.4C86,20,76.6,40,61.9,54.1C47.2,68.2,27.1,76.4,5.4,75.3C-16.3,74.2,-32.7,63.7,-47.5,51.3C-62.3,38.8,-75.6,24.5,-80.5,6.7C-85.4,-11.1,-82,-32.5,-69.3,-45.5C-56.6,-58.5,-34.7,-63.1,-15.6,-64.3C3.5,-65.5,26.4,-65.5,43.2,-61.7C59.9,-57.9,59.9,-57.9,62.3,-53.5Z"
          transform="translate(100 100)"
        />
      </svg>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        {value && <div className="text-xl font-bold font-headline sm:text-lg md:text-xl lg:text-2xl mt-1">{value}</div>}
        <div className={`text-sm font-bold mt-2 ${iconColor}`}>
            {description}
        </div>
      </CardContent>
    </Card>
  );
}
