
'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { analyzePlantDisease, type FormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LoaderCircle, UploadCloud, Leaf, AlertCircle, Camera, X } from 'lucide-react';
import { ResultsDisplay } from './results-display';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const initialState: FormState = {
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full font-bold text-lg py-6 bg-accent text-accent-foreground hover:bg-accent/90"
      aria-label="Analyze Plant"
    >
      {pending ? (
        <>
          <LoaderCircle className="animate-spin mr-2" />
          Analyzing...
        </>
      ) : (
        <>
          <Leaf className="mr-2" />
          Analyze Plant
        </>
      )}
    </Button>
  );
}

export function DiseaseDetector() {
  const [state, formAction] = useFormState(analyzePlantDisease, initialState);
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const photoDataUriRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const placeholderImage = PlaceHolderImages.find(img => img.id === 'plant-leaf-placeholder');

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.error,
      });
    }
    if (state.success) {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      stopCameraStream();
      setIsCameraOpen(false);
    }
  }, [state, toast]);

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleOpenCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        setIsCameraOpen(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    } else {
        toast({
            variant: 'destructive',
            title: 'Camera Not Supported',
            description: 'Your browser does not support camera access.',
        });
    }
  };

  const handleCloseCamera = () => {
    stopCameraStream();
    setIsCameraOpen(false);
  };
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUri);
        if (photoDataUriRef.current) {
          photoDataUriRef.current.value = dataUri;
        }
        handleCloseCamera();
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        if (photoDataUriRef.current) {
          photoDataUriRef.current.value = dataUri;
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-primary');
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        handleImageChange({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-primary');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-primary');
  };

  return (
    <div className="w-full flex-grow flex flex-col items-center px-4 py-8 md:py-12">
        <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary tracking-tight">
                Identify Plant Diseases in a Snap
            </h1>
            <p className="mt-4 text-lg text-foreground/80">
                Upload a photo of a plant leaf, tell us the plant's name, and our AI will detect potential diseases and provide personalized care tips.
            </p>
        </div>

        {isCameraOpen ? (
          <Card className="w-full max-w-2xl mt-8 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="font-headline text-3xl">Camera Preview</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCloseCamera}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video bg-black rounded-md">
                <video ref={videoRef} className="w-full h-full object-contain rounded-md" autoPlay playsInline muted />
              </div>
              {hasCameraPermission === false && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Camera Access Denied</AlertTitle>
                  <AlertDescription>
                    Please allow camera access in your browser settings to use this feature.
                  </AlertDescription>
                </Alert>
              )}
              <Button onClick={handleCapture} className="w-full py-6 text-lg" disabled={!hasCameraPermission}>
                <Camera className="mr-2" />
                Capture Image
              </Button>
            </CardContent>
          </Card>
        ) : (
            <Card className="w-full max-w-2xl mt-8 shadow-xl bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Get Started</CardTitle>
                    <CardDescription>Fill in the details below to begin your analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={formAction} className="space-y-6">
                        <input type="hidden" name="photoDataUri" ref={photoDataUriRef} />
                        <div className="space-y-2">
                            <Label htmlFor="plantName" className="text-lg font-semibold">Plant Name</Label>
                            <Input
                                id="plantName"
                                name="plantName"
                                placeholder="e.g., Tomato, Rose, Apple"
                                required
                                className="text-base py-6"
                            />
                             <p className="text-sm text-muted-foreground">
                                Providing the plant name helps us give you more accurate prevention tips.
                             </p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-lg font-semibold">Plant Leaf Image</Label>
                            <label
                              htmlFor="plantImage"
                              onDrop={handleDrop}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors"
                            >
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Plant leaf preview" fill className="object-contain rounded-lg p-2"/>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
                                        {placeholderImage && (
                                            <div className="absolute inset-0 -z-10 opacity-10">
                                                <Image
                                                    src={placeholderImage.imageUrl}
                                                    alt={placeholderImage.description}
                                                    fill
                                                    className="object-cover rounded-lg"
                                                    data-ai-hint={placeholderImage.imageHint}
                                                    priority
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </label>
                            <Input id="plantImage" name="plantImage" type="file" className="hidden" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/webp"/>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Separator className="flex-1" />
                          <span className="text-xs text-muted-foreground">OR</span>
                          <Separator className="flex-1" />
                        </div>

                        <Button type="button" variant="outline" className="w-full" onClick={handleOpenCamera}>
                          <Camera className="mr-2" />
                          Use Camera
                        </Button>
                        
                        {state.error && (
                            <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-md">
                                <AlertCircle className="size-4 shrink-0" />
                                <span>{state.error}</span>
                            </div>
                        )}
                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
        )}
        
        {state.success && state.detection && <ResultsDisplay results={state} />}
        <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}

