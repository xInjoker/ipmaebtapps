
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, User } from 'lucide-react';
import type { ApprovalStage } from '@/lib/data';
import type { User as AuthUser } from '@/lib/users';
import { useToast } from '@/hooks/use-toast';

interface ApprovalWorkflowManagerProps {
  title: string;
  description: string;
  workflow: ApprovalStage[];
  onWorkflowChange: (newWorkflow: ApprovalStage[]) => void;
  users: AuthUser[];
}

export function ApprovalWorkflowManager({
  title,
  description,
  workflow,
  onWorkflowChange,
  users,
}: ApprovalWorkflowManagerProps) {
  const [newStageRoleName, setNewStageRoleName] = useState('');
  const [newStageApproverId, setNewStageApproverId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddStage = () => {
    if (!newStageRoleName || !newStageApproverId) {
        toast({
            variant: 'destructive',
            title: 'Incomplete Stage',
            description: 'Please provide a role name and select an approver.',
        });
        return;
    }
    const newStage: ApprovalStage = {
        stage: workflow.length + 1,
        roleName: newStageRoleName,
        approverId: newStageApproverId,
    };
    onWorkflowChange([...workflow, newStage]);
    setNewStageRoleName('');
    setNewStageApproverId(null);
  };
  
  const handleRemoveStage = (stageNumber: number) => {
    const updatedWorkflow = workflow
        .filter(stage => stage.stage !== stageNumber)
        .map((stage, index) => ({...stage, stage: index + 1})); // Re-order stages
    onWorkflowChange(updatedWorkflow);
  };
  
  const handleApproverChange = (stageNumber: number, approverId: string) => {
    const updatedWorkflow = workflow.map(stage => 
        stage.stage === stageNumber ? {...stage, approverId} : stage
    );
    onWorkflowChange(updatedWorkflow);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {workflow.length > 0 ? (
          <div className="space-y-3">
            {workflow.map((stage) => {
              const approver = users.find(u => u.id.toString() === stage.approverId);
              return (
                <div key={stage.stage} className="flex items-center justify-between gap-4 rounded-md border p-3">
                    <div className="flex items-center gap-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold">{stage.stage}</span>
                        <div className="font-medium">{stage.roleName}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={stage.approverId || ''} onValueChange={(value) => handleApproverChange(stage.stage, value)}>
                            <SelectTrigger className="w-[250px]">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Select approver" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {users.map(user => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveStage(stage.stage)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </div>
            )})}
          </div>
        ) : (
          <div className="text-center text-muted-foreground p-4">No approval stages defined.</div>
        )}
        <div className="flex items-end justify-between gap-4 rounded-md border border-dashed p-4">
             <div className="grid flex-1 gap-2">
                <Label htmlFor="new-stage-role">New Stage Role Name</Label>
                <Input id="new-stage-role" placeholder="e.g. Reviewed By" value={newStageRoleName} onChange={(e) => setNewStageRoleName(e.target.value)} />
            </div>
            <div className="grid flex-1 gap-2">
                <Label htmlFor="new-stage-approver">Assign Approver</Label>
                 <Select value={newStageApproverId || ''} onValueChange={setNewStageApproverId}>
                    <SelectTrigger id="new-stage-approver">
                        <SelectValue placeholder="Select approver" />
                    </SelectTrigger>
                    <SelectContent>
                        {users.map(user => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                                {user.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={handleAddStage}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Stage
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
