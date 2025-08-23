

'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMemo } from 'react';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { useTenders } from '@/context/TenderContext';
import { formatCurrencyCompact } from '@/lib/utils';
import { HeaderCard } from '@/components/header-card';
import { DashboardWidget } from '@/components/dashboard-widget';
import Link from 'next/link';
import { type TenderStatus } from '@/lib/tenders';
import { Briefcase, CheckCircle, CircleDollarSign, Clock, ListTodo, TrendingDown, TrendingUp, Users2, Wrench, XCircle, BadgeCheck, FileText, Layers, Plane, Percent } from 'lucide-react';
import { useInspectors } from '@/context/InspectorContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TenderSummaryChart } from '@/components/tender-summary-chart';
import { TenderBranchChart } from '@/components/tender-branch-chart';
import { CumulativeCostPieChart } from '@/components/cumulative-cost-pie-chart';
import { format } from 'date-fns';
import { useEquipment } from '@/context/EquipmentContext';
import { TenderCountChart } from '@/components/tender-count-chart';
import { type Inspector, type InspectorDocument } from '@/lib/inspectors';
import { useEmployees } from '@/context/EmployeeContext';
import { InspectorCountByBranchChart } from '@/components/inspector-count-by-branch-chart';
import { InspectorCertificateStatusChart } from '@/components/inspector-certificate-status-chart';
import { EquipmentStatusChart } from '@/components/equipment-status-chart';
import { EquipmentByTypeChart } from '@/components/equipment-by-type-chart';
import { EquipmentCalibrationByBranchChart } from '@/components/equipment-calibration-by-branch-chart';
import { CumulativeIncomePieChart } from '@/components/cumulative-income-pie-chart';
import { InspectorQualificationChart } from '@/components/inspector-qualification-chart';
import { InspectorQualificationHeatmap } from '@/components/inspector-qualification-heatmap';

type CombinedPersonnel = Inspector & { type: 'Inspector' | 'Employee' };


export default function DashboardPage() {
  const { user, branches, isHqUser } = useAuth();
  const { projects, getProjectStats } = useProjects();
  const { tenders } = useTenders();
  const { inspectorStats } = useInspectors();
  const { equipmentList } = useEquipment();
  const { employees } = useEmployees();

  // --- Filter data based on user branch ---
  const visibleProjects = useMemo(() => {
    if (isHqUser || !user?.branchId) return projects;
    return projects.filter(p => p.branchId === user.branchId);
  }, [projects, user, isHqUser]);

  const visibleTenders = useMemo(() => {
    if (isHqUser || !user?.branchId) return tenders;
    return tenders.filter(t => t.branchId === user.branchId);
  }, [tenders, user, isHqUser]);


  // --- Combined Personnel for Inspector Tab ---
  const combinedPersonnel: CombinedPersonnel[] = useMemo(() => {
    const inspectorsFromDb: CombinedPersonnel[] = inspectorStats.inspectors.map(i => ({ ...i, type: 'Inspector' as const, branchId: i.branchId }));
    const promotedEmployees: CombinedPersonnel[] = employees
      .filter(e => e.isPromotedToInspector && e.id)
      .map(e => {
        let yearsOfExperience = 0;
        if (e.contractStartDate && !isNaN(new Date(e.contractStartDate).getTime())) {
            const startDate = new Date(e.contractStartDate);
            const today = new Date();
            yearsOfExperience = today.getFullYear() - startDate.getFullYear();
            const m = today.getMonth() - startDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < startDate.getDate())) {
                yearsOfExperience--;
            }
        }
        return {
            id: e.id!,
            name: e.name || 'Unknown',
            email: e.email || '',
            phone: e.phoneNumber || '',
            position: 'Inspector',
            employmentStatus: 'Organik' as Inspector['employmentStatus'],
            yearsOfExperience: yearsOfExperience > 0 ? yearsOfExperience : undefined,
            avatarUrl: '',
            cvUrl: e.cvUrl || '',
            qualifications: (e.qualifications as InspectorDocument[]) || [],
            otherDocuments: (e.otherDocuments as InspectorDocument[]) || [],
            branchId: e.workUnit || '',
            type: 'Employee' as const,
        };
      });
    return [...inspectorsFromDb, ...promotedEmployees];
  }, [inspectorStats.inspectors, employees]);

  // --- Tender Segment Calculations ---
  const tenderStats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const tendersToProcess = visibleTenders.filter(t => new Date(t.submissionDate).getFullYear() === currentYear);
    
    const initialStats = { count: 0, value: 0 };
    const statusMetrics = tendersToProcess.reduce((acc, tender) => {
        const status = tender.status;
        if (!acc[status]) {
            acc[status] = { count: 0, value: 0 };
        }
        acc[status].count += 1;
        const value = tender.bidPrice || tender.ownerEstimatePrice || 0;
        acc[status].value += value;
        return acc;
    }, {} as Record<TenderStatus, { count: number; value: number }>);

    const awardedCount = statusMetrics['Awarded']?.count || 0;
    const lostCount = statusMetrics['Lost']?.count || 0;
    const totalDecided = awardedCount + lostCount;
    const winRate = totalDecided > 0 ? (awardedCount / totalDecided) * 100 : 0;
    
    const tendersToWatch = tendersToProcess.filter(t => {
      const subDate = new Date(t.submissionDate);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      return subDate >= today && subDate <= nextWeek;
    }).length;

    const topAwarded = tendersToProcess
        .filter(t => t.status === 'Awarded')
        .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
        .slice(0, 5);

    return {
        inProgressValue: ['Aanwijzing', 'Bidding', 'Evaluation', 'Prequalification'].reduce((sum, s) => sum + (statusMetrics[s as TenderStatus]?.value || 0), 0),
        winRate,
        awardedValueYTD: statusMetrics['Awarded']?.value || 0,
        tendersToWatch,
        topUpcoming: tendersToProcess.filter(t => new Date(t.submissionDate) >= new Date()).sort((a,b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime()).slice(0,5),
        topAwarded,
        ytdTenders: tendersToProcess,
    };
  }, [visibleTenders]);
  
  const tenderWidgets = useMemo(() => {
      return [
        {
          title: 'Tender Value In Progress',
          value: `${formatCurrencyCompact(tenderStats.inProgressValue)}`,
          description: 'For active tenders this year',
          icon: Clock,
          iconColor: 'text-amber-500',
          shapeColor: 'text-amber-500/10',
        },
        {
          title: 'Win Rate (YTD)',
          value: `${tenderStats.winRate.toFixed(1)}%`,
          description: 'Of all decided tenders',
          icon: TrendingUp,
          iconColor: 'text-green-500',
          shapeColor: 'text-green-500/10',
        },
        {
          title: 'Awarded Value (YTD)',
          value: `${formatCurrencyCompact(tenderStats.awardedValueYTD)}`,
          description: 'Won this year',
          icon: CircleDollarSign,
          iconColor: 'text-blue-500',
          shapeColor: 'text-blue-500/10',
        },
        {
          title: 'Tenders to Watch',
          value: `${tenderStats.tendersToWatch}`,
          description: 'Due in the next 7 days',
          icon: ListTodo,
          iconColor: 'text-rose-500',
          shapeColor: 'text-rose-500/10',
        },
      ];
  }, [tenderStats]);


  // --- Project Segment Calculations (YTD) ---
  const projectsYTD = useMemo(() => {
    const currentYear = new Date().getFullYear().toString();
    return visibleProjects.map(p => ({
        ...p,
        invoices: (p.invoices || []).filter(i => i.period.endsWith(currentYear)),
        costs: (p.costs || []).filter(c => c.period.endsWith(currentYear)),
    }));
  }, [visibleProjects]);
  
  const projectStats = useMemo(() => {
    const stats = getProjectStats(projectsYTD);
    const atRiskCount = visibleProjects.filter(p => {
        const projectStats = getProjectStats([p]);
        if (projectStats.totalCost === 0) return false;
        
        const earnedValue = p.value * ((projectStats.totalPaid + projectStats.totalInvoiced) / p.value);
        const cpi = earnedValue / projectStats.totalCost;
        return cpi < 1;
    }).length;

    const totalPAD = projectsYTD
      .flatMap(p => p.invoices || [])
      .filter(i => i.status === 'PAD')
      .reduce((sum, i) => sum + i.value, 0);

    return {
      ...stats,
      totalPAD,
      outstandingCash: stats.totalInvoiced,
      atRiskCount,
      lowestMarginProjects: visibleProjects.map(p => {
          const s = getProjectStats([p]);
          const margin = s.totalIncome > 0 ? ((s.totalIncome - s.totalCost) / s.totalIncome) * 100 : 0;
          return { name: p.name, id: p.id, margin: margin, contractExecutor: p.contractExecutor };
      }).filter(p => p.margin < 10).sort((a, b) => a.margin - b.margin).slice(0, 5),
    };
  }, [visibleProjects, projectsYTD, getProjectStats]);
  
  const overallProfit = projectStats.totalIncome - projectStats.totalCost;
  const overallProfitPercentage = projectStats.totalIncome > 0 ? (overallProfit / projectStats.totalIncome) * 100 : 0;
  const profitLossDescription = overallProfit >= 0
    ? `Currently profitable by ${overallProfitPercentage.toFixed(1)}%`
    : `Currently at a loss by ${Math.abs(overallProfitPercentage).toFixed(1)}%`;
  const padPercentage = projectStats.totalIncome > 0 ? (projectStats.totalPAD / projectStats.totalIncome) * 100 : 0;


  // --- Inspector Segment Calculations ---
  const inspectorWidgetData = useMemo(() => [
    { title: 'Total Certified Inspectors', value: `${inspectorStats.total}`, description: 'inspectors in the database', icon: Users2, iconColor: 'text-blue-500', shapeColor: 'text-blue-500/10' },
    { title: 'Total Valid Certificates', value: `${inspectorStats.validCerts}`, description: 'certificates are currently valid', icon: CheckCircle, iconColor: 'text-green-500', shapeColor: 'text-green-500/10' },
    { title: 'Expiring Certificates', value: `${inspectorStats.expiringSoon}`, description: 'inspectors with certs expiring soon', icon: Clock, iconColor: 'text-amber-500', shapeColor: 'text-amber-500/10' },
    { title: 'Expired Certificates', value: `${inspectorStats.expired}`, description: 'inspectors with expired certs', icon: XCircle, iconColor: 'text-rose-500', shapeColor: 'text-rose-500/10' },
  ], [inspectorStats]);

  // --- Equipment Segment Calculations ---
  const equipmentStats = useMemo(() => {
    const total = equipmentList.length;
    const normal = equipmentList.filter(e => e.status === 'Normal').length;
    
    let validCerts = 0;
    let expiredCerts = 0;

    equipmentList.forEach(e => {
        if (e.calibrationDueDate) {
            const dueDate = new Date(e.calibrationDueDate);
            const today = new Date();
            const timeDiff = dueDate.getTime() - today.getTime();
            const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            if (daysLeft < 0) {
                expiredCerts++;
            } else {
                validCerts++;
            }
        }
    });
    return { total, normal, validCerts, expiredCerts };
  }, [equipmentList]);

  const equipmentWidgetData = useMemo(() => [
    {
        title: 'Total Equipment',
        value: `${equipmentStats.total}`,
        description: 'items in inventory',
        icon: Wrench,
        iconColor: 'text-blue-500',
        shapeColor: 'text-blue-500/10',
    },
    {
        title: 'Normal Status',
        value: `${equipmentStats.normal}`,
        description: 'equipment are operational',
        icon: CheckCircle,
        iconColor: 'text-green-500',
        shapeColor: 'text-green-500/10',
    },
    {
        title: 'Valid Calibrations',
        value: `${equipmentStats.validCerts}`,
        description: 'equipment with valid calibration',
        icon: BadgeCheck,
        iconColor: 'text-amber-500',
        shapeColor: 'text-amber-500/10',
    },
    {
        title: 'Expired Calibrations',
        value: `${equipmentStats.expiredCerts}`,
        description: 'items require calibration',
        icon: XCircle,
        iconColor: 'text-rose-500',
        shapeColor: 'text-rose-500/10',
    },
  ], [equipmentStats]);

  return (
    <div className="space-y-6">
      <HeaderCard
        title={`Welcome, ${user?.name}`}
        description="Here's a comprehensive overview of your business operations."
      />
      
      <Tabs defaultValue="tenders" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tenders">Tenders</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="inspectors">Inspectors</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>
        
        {/* Tender Tab */}
        <TabsContent value="tenders" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {tenderWidgets.map((widget, index) => <DashboardWidget key={index} {...widget} />)}
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TenderSummaryChart tenders={tenderStats.ytdTenders} />
                <TenderCountChart tenders={tenderStats.ytdTenders} />
                <TenderBranchChart tenders={tenderStats.ytdTenders} branches={branches} />
                 <Card>
                    <CardHeader><CardTitle>Top 5 Upcoming Tenders</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Client</TableHead><TableHead>Submission Date</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {tenderStats.topUpcoming.map(t => (
                                    <TableRow key={t.id}><TableCell className="font-medium"><Link href={`/tenders/${t.id}`} className="hover:underline">{t.title}</Link></TableCell><TableCell>{t.client}</TableCell><TableCell>{format(new Date(t.submissionDate), 'PPP')}</TableCell></TableRow>
                                ))}
                                {tenderStats.topUpcoming.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No upcoming tenders.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Top 5 Recent Awarded Tenders</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Client</TableHead><TableHead>Awarded Date</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {tenderStats.topAwarded.map(t => (
                                    <TableRow key={t.id}><TableCell className="font-medium"><Link href={`/tenders/${t.id}`} className="hover:underline">{t.title}</Link></TableCell><TableCell>{t.client}</TableCell><TableCell>{format(new Date(t.submissionDate), 'PPP')}</TableCell></TableRow>
                                ))}
                                {tenderStats.topAwarded.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No recent awarded tenders.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        {/* Project Tab */}
        <TabsContent value="projects" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <DashboardWidget 
                    title="Overall Profit/Loss (YTD)" 
                    value={formatCurrencyCompact(overallProfit)} 
                    description={profitLossDescription}
                    icon={overallProfit >= 0 ? TrendingUp : TrendingDown} 
                    iconColor={overallProfit >= 0 ? 'text-green-500' : 'text-rose-500'} 
                    shapeColor={overallProfit >= 0 ? 'text-green-500/10' : 'text-rose-500/10'}
                />
                <DashboardWidget title="Outstanding Cash (YTD)" value={formatCurrencyCompact(projectStats.outstandingCash)} description="Value of invoice" icon={CircleDollarSign} iconColor="text-amber-500" shapeColor="text-amber-500/10" />
                <DashboardWidget title="Total PAD" value={formatCurrencyCompact(projectStats.totalPAD)} description={`${padPercentage.toFixed(1)}% of total income`} icon={Briefcase} iconColor="text-blue-500" shapeColor="text-blue-500/10" />
                <DashboardWidget title="Projects at Risk" value={`${projectStats.atRiskCount}`} description="Projects with CPI < 1" icon={XCircle} iconColor="text-rose-500" shapeColor="text-rose-500/10" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CumulativeIncomePieChart projects={projectsYTD} />
                <CumulativeCostPieChart projects={projectsYTD} />
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Projects with Lowest Profit Margin</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Branch Executor</TableHead><TableHead className="text-right">Current Margin</TableHead></TableRow></TableHeader>
                             <TableBody>
                                {projectStats.lowestMarginProjects.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium"><Link href={`/projects/${p.id}`} className="hover:underline">{p.name}</Link></TableCell>
                                        <TableCell>{p.contractExecutor}</TableCell>
                                        <TableCell className="text-right font-mono">{p.margin.toFixed(2)}%</TableCell>
                                    </TableRow>
                                ))}
                                {projectStats.lowestMarginProjects.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No projects with low profit margin.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        
        {/* Inspector Tab */}
        <TabsContent value="inspectors" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {inspectorWidgetData.map((widget, index) => <DashboardWidget key={index} {...widget} />)}
            </div>
             <div className="grid grid-cols-1 gap-6">
                <InspectorQualificationHeatmap inspectors={combinedPersonnel} branches={branches} />
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InspectorCountByBranchChart inspectors={combinedPersonnel} branches={branches} />
                <InspectorCertificateStatusChart inspectors={combinedPersonnel} />
                <InspectorQualificationChart inspectors={combinedPersonnel} />
            </div>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {equipmentWidgetData.map((widget, index) => <DashboardWidget key={index} {...widget} />)}
            </div>
            <div className="grid grid-cols-1 gap-6">
                <EquipmentCalibrationByBranchChart equipment={equipmentList} branches={branches} />
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EquipmentByTypeChart equipment={equipmentList} />
                <EquipmentStatusChart equipment={equipmentList} />
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
