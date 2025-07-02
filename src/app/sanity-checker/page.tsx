import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SanityCheckForm } from './form';

export default function SanityCheckerPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI Report Sanity Checker</CardTitle>
          <CardDescription>
            Leverage AI to review your project data. It provides suggestions for
            important facts or potential issues you might have overlooked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SanityCheckForm />
        </CardContent>
      </Card>
    </div>
  );
}
