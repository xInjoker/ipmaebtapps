
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

type HeaderCardProps = {
    title: string;
    description: string;
    children?: React.ReactNode;
};

export function HeaderCard({ title, description, children }: HeaderCardProps) {
    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <svg
                className="absolute -right-16 -top-24 text-warning"
                fill="currentColor"
                width="400"
                height="400"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M51.9,-54.9C64.6,-45.5,71.2,-28.9,72,-12.3C72.8,4.2,67.7,20.8,58.3,34.5C48.9,48.2,35.1,59.1,20,64.2C4.9,69.3,-11.5,68.6,-26.4,62.8C-41.2,57,-54.6,46,-61.7,31.7C-68.9,17.4,-70,-0.1,-64.7,-14.8C-59.4,-29.4,-47.8,-41.3,-35,-50.7C-22.3,-60,-8.4,-67,5.5,-69.6C19.4,-72.2,39.1,-70.4,51.9,-54.9Z"
                    transform="translate(100 100)"
                />
            </svg>
            <svg
                className="absolute -left-20 -bottom-24 text-primary-foreground/10"
                fill="currentColor"
                width="400"
                height="400"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M51.9,-54.9C64.6,-45.5,71.2,-28.9,72,-12.3C72.8,4.2,67.7,20.8,58.3,34.5C48.9,48.2,35.1,59.1,20,64.2C4.9,69.3,-11.5,68.6,-26.4,62.8C-41.2,57,-54.6,46,-61.7,31.7C-68.9,17.4,-70,-0.1,-64.7,-14.8C-59.4,-29.4,-47.8,-41.3,-35,-50.7C-22.3,-60,-8.4,-67,5.5,-69.6C19.4,-72.2,39.1,-70.4,51.9,-54.9Z"
                    transform="translate(100 100)"
                />
            </svg>
            <div className="z-10 relative flex flex-row items-start justify-between">
                 <CardHeader className="flex-grow">
                     <CardTitle className="font-headline">{title}</CardTitle>
                     <CardDescription className="text-primary-foreground/90">{description}</CardDescription>
                 </CardHeader>
                 {children && (
                     <CardContent className="pt-6 pr-6">
                        {children}
                     </CardContent>
                 )}
            </div>
        </Card>
    );
}
