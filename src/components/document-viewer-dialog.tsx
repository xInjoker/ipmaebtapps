'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DocumentViewerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  documentUrl: string;
  documentName: string;
}

export function DocumentViewerDialog({
  isOpen,
  onOpenChange,
  documentUrl,
  documentName,
}: DocumentViewerDialogProps) {
  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>{documentName}</DialogTitle>
          <DialogDescription>
            Previewing document. You can also download it.
          </DialogDescription>
        </DialogHeader>
        <div className="h-full flex-grow border rounded-md overflow-hidden">
          <iframe
            src={documentUrl}
            width="100%"
            height="100%"
            title={documentName}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={downloadFile}>Download</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
