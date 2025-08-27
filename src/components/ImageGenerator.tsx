import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, ImageIcon, Loader2 } from 'lucide-react';

const ImageGenerator = () => {
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ [key: string]: string }>({});

  const imagePrompts = [
    {
      key: 'hero-address-system',
      filename: 'hero-address-system.jpg',
      prompt: 'Professional photograph of diverse African people in Equatorial Guinea using smartphones and tablets to access digital government services, with modern Malabo city skyline in the background. People of various ages working together, some in business attire, others in casual wear. Bright, optimistic lighting with blue and green color scheme. High-quality, realistic photography style.'
    },
    {
      key: 'feature-address-registration',
      filename: 'feature-address-registration.jpg', 
      prompt: 'Professional photograph of a young African woman in Equatorial Guinea holding a smartphone, registering her address on a digital platform. She is standing in front of a typical Equatorial Guinea residential building with traditional architecture. Natural lighting, modern technology meets local culture. High-quality, realistic photography.'
    },
    {
      key: 'feature-address-search',
      filename: 'feature-address-search.jpg',
      prompt: 'Professional photograph of an African government worker in Equatorial Guinea using a computer to search the national address database. Clean, modern office environment with maps of Equatorial Guinea on the wall. Professional attire, focused expression. Bright, clean lighting. High-quality, realistic photography.'
    },
    {
      key: 'feature-emergency-management', 
      filename: 'feature-emergency-management.jpg',
      prompt: 'Professional photograph of African police officers and emergency responders in Equatorial Guinea using tablets and mobile devices for incident management. Police vehicles and emergency equipment in background. Professional uniforms, diverse team working together. Dynamic lighting with red and blue emergency color accents. High-quality, realistic photography.'
    }
  ];

  const generateImages = async () => {
    setGenerating(true);
    const newGeneratedImages: { [key: string]: string } = {};

    try {
      for (const imageConfig of imagePrompts) {
        toast.info(`Generating ${imageConfig.key}...`);
        
        const { data, error } = await supabase.functions.invoke('generate-platform-images', {
          body: { 
            prompt: imageConfig.prompt,
            filename: imageConfig.filename
          }
        });

        if (error) {
          console.error('Error generating image:', error);
          toast.error(`Failed to generate ${imageConfig.key}`);
          continue;
        }

        if (data?.imageData) {
          // Convert base64 to blob
          const byteCharacters = atob(data.imageData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/jpeg' });
          
          // Create download URL
          const imageUrl = URL.createObjectURL(blob);
          newGeneratedImages[imageConfig.key] = imageUrl;
          
          toast.success(`Generated ${imageConfig.key}`);
        }
      }

      setGeneratedImages(newGeneratedImages);
      toast.success('All images generated successfully!');
    } catch (error) {
      console.error('Error generating images:', error);
      toast.error('Failed to generate images');
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = (key: string, filename: string) => {
    const imageUrl = generatedImages[key];
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloaded ${filename}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Platform Image Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Generate contextually relevant images for the ConnectNation Platform featuring people from Equatorial Guinea.
          </p>
          
          <Button 
            onClick={generateImages} 
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Images...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4 mr-2" />
                Generate All Images
              </>
            )}
          </Button>

          {Object.keys(generatedImages).length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Generated Images:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imagePrompts.map((config) => (
                  <div key={config.key} className="space-y-2">
                    {generatedImages[config.key] && (
                      <>
                        <img 
                          src={generatedImages[config.key]} 
                          alt={config.key}
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadImage(config.key, config.filename)}
                          className="w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download {config.filename}
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageGenerator;