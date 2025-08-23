

'use client';

import { useFormContext } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/context/ProjectContext';
import { useEmployees } from '@/context/EmployeeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { portfolios, subPortfolios } from '@/lib/employees';
import { useMemo, useEffect } from 'react';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from './ui/form';

export function EmployeeFormStep1({ form }: { form: any }) {
    const { branches } = useAuth();
    const { employees } = useEmployees();
    const { projects } = useProjects();
    const employee = form.getValues();

    const watchedWorkUnit = form.watch('workUnit');
    const watchedProjectName = form.watch('projectName');

    const availableProjects = useMemo(() => {
        if (!watchedWorkUnit || !projects || projects.length === 0) return [];
        return projects.filter(p => p.branchId === watchedWorkUnit);
    }, [projects, watchedWorkUnit]);

    useEffect(() => {
        if (watchedProjectName) {
            const selectedProject = projects.find(p => p.name === watchedProjectName);
            if (selectedProject) {
                form.setValue('rabNumber', selectedProject.rabNumber);
            }
        } else {
            form.setValue('rabNumber', '');
        }
    }, [watchedProjectName, projects, form]);

    useEffect(() => {
        if (watchedWorkUnit) {
            const selectedBranch = branches.find(b => b.id === watchedWorkUnit);
            if (selectedBranch) {
                form.setValue('workUnitName', selectedBranch.name);
            }
        }
    }, [watchedWorkUnit, branches, form]);
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="reportingManagerId"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Reporting Manager</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value || 'none'}>
                                <SelectTrigger><SelectValue placeholder="Select a manager..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={'none'}>None</SelectItem>
                                    {employees.filter(e => e.id !== employee?.id).map(mgr => (
                                        <SelectItem key={mgr.id} value={mgr.id}>{mgr.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Position</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="workUnit"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Branch</FormLabel>
                        <FormControl>
                            <Select onValueChange={(v) => { field.onChange(v); form.setValue('projectName', ''); form.setValue('rabNumber', ''); }} value={field.value || ''}>
                                <SelectTrigger><SelectValue placeholder="Select a branch..." /></SelectTrigger>
                                <SelectContent>
                                    {branches.map(branch => (
                                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                             <Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchedWorkUnit}>
                                <SelectTrigger><SelectValue placeholder="Select a project..." /></SelectTrigger>
                                <SelectContent>
                                    {availableProjects.map(project => (
                                        <SelectItem key={project.id} value={project.name}>{project.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="rabNumber"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>RAB Number</FormLabel>
                        <FormControl><Input {...field} readOnly /></FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="portfolio"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Portfolio</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <SelectTrigger><SelectValue placeholder="Select a portfolio..." /></SelectTrigger>
                                <SelectContent>
                                    {portfolios.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="subPortfolio"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Sub-Portfolio</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <SelectTrigger><SelectValue placeholder="Select a sub-portfolio..." /></SelectTrigger>
                                <SelectContent>
                                    {subPortfolios.map(sp => <SelectItem key={sp} value={sp}>{sp}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="competency"
                render={({ field }) => (
                    <FormItem className="md:col-span-2 space-y-2">
                        <FormLabel>Competency</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
}
