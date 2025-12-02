'use client';

import { useEffect, useRef, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { analyzePlantDisease, type FormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LoaderCircle, UploadCloud, Leaf, AlertCircle, Camera, X, Check } from 'lucide-react';
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
      className="w-full font-bold text-lg py-7 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
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
  const [state, formAction] = useActionState(analyzePlantDisease, initialState);
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
    if (isCameraOpen) {
      const getCameraPermission = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasCameraPermission(true);
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
            setIsCameraOpen(false);
          }
        } else {
            toast({
                variant: 'destructive',
                title: 'Camera Not Supported',
                description: 'Your browser does not support camera access.',
            });
            setIsCameraOpen(false);
        }
      };
      getCameraPermission();
    } else {
        stopCameraStream();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraOpen, toast]);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.error,
      });
    }
    if (state.success) {
        toast({
            variant: 'default',
            title: 'Analysis Complete',
            description: 'Your plant analysis results are ready.',
            className: 'bg-primary text-primary-foreground',
        })
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

  const handleOpenCamera = () => {
    setIsCameraOpen(true);
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
    e.currentTarget.classList.remove('border-primary', 'ring-2', 'ring-primary');
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
    e.currentTarget.classList.add('border-primary', 'ring-2', 'ring-primary');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-primary', 'ring-2', 'ring-primary');
  };

  return (
    <div className="w-full flex-grow flex flex-col items-center px-4 py-8 md:py-16">
        <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary tracking-tight">
                Identify Plant Diseases in a Snap
            </h1>
            <p className="mt-4 text-lg md:text-xl text-foreground/80">
                Upload a photo of a plant leaf, and our AI will identify the plant, detect potential diseases, and provide personalized care tips.
            </p>
        </div>

        {isCameraOpen ? (
          <Card className="w-full max-w-2xl mt-12 shadow-2xl bg-card border-t-4 border-primary">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="font-headline text-3xl flex items-center gap-2"><Camera /> Camera Preview</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCloseCamera}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-contain" autoPlay playsInline muted />
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
              <Button onClick={handleCapture} className="w-full py-6 text-lg" disabled={hasCameraPermission === false}>
                <Camera className="mr-2" />
                Capture Image
              </Button>
            </CardContent>
          </Card>
        ) : (
            <Card className="w-full max-w-2xl mt-12 shadow-2xl bg-card border-t-4 border-primary">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Get Started</CardTitle>
                    <CardDescription>Upload an image of a plant leaf to begin your analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={formAction} className="space-y-6">
                        <input type="hidden" name="photoDataUri" ref={photoDataUriRef} />
                        <div className="space-y-2">
                            <Label htmlFor="plantImage" className="text-lg font-semibold">Plant Leaf Image</Label>
                            <label
                              htmlFor="plantImage"
                              onDrop={handleDrop}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-all duration-300 ease-in-out"
                            >
                                {imagePreview ? (
                                  <>
                                    <Image src={imagePreview} alt="Plant leaf preview" fill className="object-contain rounded-lg p-2"/>
                                    <div className="absolute top-2 right-2 flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold py-1 px-2 rounded-full">
                                        <Check className="size-4" />
                                        <span>Image selected</span>
                                    </div>
                                  </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center text-muted-foreground">
                                        <UploadCloud className="w-12 h-12 mb-4" />
                                        <p className="mb-2 text-lg">
                                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-sm">PNG, JPG, or WEBP</p>
                                        {placeholderImage && (
                                            <div className="absolute inset-0 -z-10 opacity-5">
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

                        <div className="flex items-center space-x-4">
                          <Separator className="flex-1" />
                          <span className="text-sm text-muted-foreground font-semibold">OR</span>
                          <Separator className="flex-1" />
                        </div>

                        <Button type="button" variant="outline" className="w-full py-6 text-lg" onClick={handleOpenCamera}>
                          <Camera className="mr-2" />
                          Use Your Camera
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
