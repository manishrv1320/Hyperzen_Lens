import type { FormState } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Sparkles, Sprout } from 'lucide-react';

interface ResultsDisplayProps {
  results: FormState;
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results.success || !results.detection) {
    return null;
  }

  const { detection, treatment } = results;

  return (
    <section id="results" className="w-full max-w-2xl mx-auto space-y-8 py-8">
      <Card className="bg-card/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sprout className="size-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-2xl">Plant Identification</CardTitle>
              <CardDescription>
                We've identified your plant.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className="font-semibold text-lg">{detection.plantName}</h3>
                    <p className="text-sm text-muted-foreground">Common Name</p>
                </div>
                <div>
                    <h3 className="font-semibold text-lg italic">{detection.scientificName}</h3>
                    <p className="text-sm text-muted-foreground">Scientific Name</p>
                </div>
            </div>
        </CardContent>
      </Card>


      <Card className="bg-card/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            {detection.diseaseDetected ? (
              <AlertTriangle className="size-8 text-destructive" />
            ) : (
              <CheckCircle2 className="size-8 text-primary" />
            )}
            <div>
              <CardTitle className="font-headline text-2xl">Disease Analysis</CardTitle>
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

      {treatment && treatment.treatmentTips && (
        <Card className="bg-card/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
             <div className="flex items-center gap-3">
              <Sparkles className="size-8 text-primary" />
              <div>
                <CardTitle className="font-headline text-2xl">Personalized Treatment Plan</CardTitle>
                <CardDescription>AI-generated suggestions to help your plant recover.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-foreground/90">
              {treatment.treatmentTips.split('\n').map((tip, index) => (
                tip.trim() && <li key={index}>{tip.replace(/^- /, '')}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
