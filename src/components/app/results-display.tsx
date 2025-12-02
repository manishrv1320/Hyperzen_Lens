import type { FormState } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Sparkles, Sprout, Bot } from 'lucide-react';

interface ResultsDisplayProps {
  results: FormState;
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results.success || !results.detection) {
    return null;
  }

  const { detection, treatment } = results;

  return (
    <section id="results" className="w-full max-w-2xl mx-auto space-y-8 py-12">
       <div className="text-center">
        <h2 className="text-3xl font-bold font-headline text-primary">Analysis Results</h2>
        <p className="text-muted-foreground mt-2">Here's what our AI found about your plant.</p>
      </div>

      <Card className="shadow-lg border-t-4 border-primary overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
                <Sprout className="size-8 text-primary" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">Plant Identification</CardTitle>
              <CardDescription>
                We've identified your plant as:
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center md:text-left p-4 bg-secondary/50 rounded-lg">
                <div>
                    <h3 className="font-semibold text-xl">{detection.plantName}</h3>
                    <p className="text-sm text-muted-foreground">Common Name</p>
                </div>
                <div className="md:border-l md:pl-4">
                    <h3 className="font-semibold text-xl italic">{detection.scientificName}</h3>
                    <p className="text-sm text-muted-foreground">Scientific Name</p>
                </div>
            </div>
        </CardContent>
      </Card>


      <Card className={`shadow-lg border-t-4 ${detection.diseaseDetected ? 'border-destructive' : 'border-primary'} overflow-hidden`}>
        <CardHeader>
          <div className="flex items-center gap-4">
             <div className={`p-3 rounded-full ${detection.diseaseDetected ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                {detection.diseaseDetected ? (
                  <AlertTriangle className="size-8 text-destructive" />
                ) : (
                  <CheckCircle2 className="size-8 text-primary" />
                )}
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">Disease Analysis</CardTitle>
              <CardDescription>
                {detection.diseaseDetected
                  ? `Unfortunately, we've identified a potential issue.`
                  : 'Great news! Your plant appears to be healthy!'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {detection.diseaseDetected ? (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h3 className="font-semibold text-lg">{detection.diseaseName}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant={detection.confidence > 0.7 ? "default" : "secondary"} className={detection.confidence > 0.7 ? "bg-destructive text-destructive-foreground" : ""}>Confidence</Badge>
                  <Progress value={detection.confidence * 100} className="w-full max-w-xs" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {(detection.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
             <p className="text-center text-lg p-4">No diseases were detected in the provided image. Keep up the great work!</p>
          )}
        </CardContent>
      </Card>

      {treatment && treatment.treatmentTips && (
        <Card className="shadow-lg border-t-4 border-accent overflow-hidden">
          <CardHeader>
             <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-full">
                    <Sparkles className="size-8 text-accent" />
                </div>
              <div>
                <CardTitle className="font-headline text-2xl">Personalized Treatment Plan</CardTitle>
                <CardDescription>AI-generated suggestions to help your plant recover.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm md:prose-base max-w-none text-foreground/90 bg-secondary/30 p-4 rounded-lg">
              <ul className="list-disc space-y-2 pl-5">
                {treatment.treatmentTips.split('\n').map((tip, index) => (
                  tip.trim() && <li key={index}>{tip.replace(/^- /, '')}</li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <Bot className="size-4"/>
                <span>Powered by Generative AI. Please verify suggestions with a professional.</span>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
