import type { FormState } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface ResultsDisplayProps {
  results: FormState;
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results.success || !results.detection) {
    return null;
  }

  const { detection, prevention } = results;

  return (
    <section id="results" className="w-full max-w-2xl mx-auto space-y-8 py-8">
      <Card className="bg-card/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            {detection.diseaseDetected ? (
              <AlertTriangle className="size-8 text-destructive" />
            ) : (
              <CheckCircle2 className="size-8 text-primary" />
            )}
            <div>
              <CardTitle className="font-headline text-2xl">Analysis Complete</CardTitle>
              <CardDescription>
                {detection.diseaseDetected
                  ? `We've identified a potential issue.`
                  : 'Your plant appears to be healthy!'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {detection.diseaseDetected ? (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h3 className="font-semibold text-lg">{detection.diseaseName}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">Confidence</Badge>
                  <Progress value={detection.confidence * 100} className="w-full max-w-xs" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {(detection.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
             <p className="text-center p-4">No diseases were detected in the provided image. Keep up the great work!</p>
          )}
        </CardContent>
      </Card>

      {prevention && prevention.preventionTips && (
        <Card className="bg-card/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
             <div className="flex items-center gap-3">
              <Sparkles className="size-8 text-primary" />
              <div>
                <CardTitle className="font-headline text-2xl">Personalized Prevention Plan</CardTitle>
                <CardDescription>AI-generated tips to keep your plant thriving.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-foreground/90">
              {prevention.preventionTips.split('\n').map((tip, index) => (
                tip.trim() && <li key={index}>{tip.replace(/^- /, '')}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
