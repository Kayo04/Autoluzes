import { useState, useCallback } from 'react';
import { useTranslations } from '@/lib/translations';
import { LightType } from '@/models/Report';
import { Upload, Sparkles, Loader2, AlertCircle, Camera, X } from 'lucide-react';

interface LightSelectorProps {
  selectedLights: LightType[];
  onLightsChange: (lights: LightType[]) => void;
  onImageUpload?: (file: File) => void;
  onDetectionMethodChange?: (method: 'manual' | 'ai') => void;
}

export default function LightSelector({
  selectedLights,
  onLightsChange,
  onImageUpload,
  onDetectionMethodChange,
}: LightSelectorProps) {
  const t = useTranslations('report');
  const tLights = useTranslations('lights');

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<LightType[]>([]);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [showAiHelper, setShowAiHelper] = useState(false);

  // All available lights
  const allLights: { id: LightType; label: string; category: 'front' | 'rear' }[] = [
    { id: 'left-headlight', label: tLights('left-headlight'), category: 'front' },
    { id: 'right-headlight', label: tLights('right-headlight'), category: 'front' },
    { id: 'left-front-indicator', label: tLights('left-front-indicator'), category: 'front' },
    { id: 'right-front-indicator', label: tLights('right-front-indicator'), category: 'front' },
    { id: 'fog-lights', label: tLights('fog-lights'), category: 'front' },
    { id: 'left-brake', label: tLights('left-brake'), category: 'rear' },
    { id: 'right-brake', label: tLights('right-brake'), category: 'rear' },
    { id: 'center-brake', label: tLights('center-brake'), category: 'rear' },
    { id: 'left-rear-indicator', label: tLights('left-rear-indicator'), category: 'rear' },
    { id: 'right-rear-indicator', label: tLights('right-rear-indicator'), category: 'rear' },
    { id: 'reverse-light', label: tLights('reverse-light'), category: 'rear' },
    { id: 'license-plate-light', label: tLights('license-plate-light'), category: 'rear' },
  ];

  const frontLights = allLights.filter((l) => l.category === 'front');
  const rearLights = allLights.filter((l) => l.category === 'rear');

  const isSelected = (id: LightType) => selectedLights.includes(id);

  const toggleLight = (id: LightType) => {
    if (isSelected(id)) {
      onLightsChange(selectedLights.filter((light) => light !== id));
    } else {
      onLightsChange([...selectedLights, id]);
    }
  };

  const handleImageSelect = useCallback((file: File) => {
    setUploadedImage(file);
    setAnalysisError(null);
    setAiSuggestions([]);
    setAiConfidence(null);
    setShowAiHelper(false);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notify parent
    onImageUpload?.(file);
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageSelect(file);
    }
  }, [handleImageSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  }, [handleImageSelect]);

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setAiSuggestions([]);
    setAiConfidence(null);
    setAnalysisError(null);
    setShowAiHelper(false);
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);

      const response = await fetch('/api/analyze-lights', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed error from API
        const errorMessage = data.details || data.error || 'Failed to analyze image';
        throw new Error(errorMessage);
      }
      
      // Store AI suggestions but don't auto-select
      setAiSuggestions(data.lights);
      setAiConfidence(data.confidence);
      onDetectionMethodChange?.('ai');

    } catch (error) {
      console.error('Error analyzing image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze image. Please try again.';
      setAnalysisError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (lightId: LightType) => {
    if (!isSelected(lightId)) {
      onLightsChange([...selectedLights, lightId]);
    }
  };

  const applyAllSuggestions = () => {
    const newLights = [...new Set([...selectedLights, ...aiSuggestions])];
    onLightsChange(newLights);
  };

  return (
    <div className="space-y-8">
      {/* STEP 1: PHOTO UPLOAD (Optional - for report evidence) */}
      <div className="bg-card rounded-2xl p-6 border-2 border-border shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {t('photoLabel') || 'Photo (Optional)'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('photoWarning') || 'Only take photos if it is safe to do so'}
              </p>
            </div>
          </div>
        </div>

        {!imagePreview ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="bg-accent/50 rounded-xl p-8 border-2 border-dashed border-border hover:border-blue-500 transition-all cursor-pointer"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="flex flex-col items-center gap-3 cursor-pointer">
              <Upload className="w-12 h-12 text-blue-400" />
              <div className="text-center">
                <p className="font-semibold text-foreground">
                  {t('uploadPrompt') || 'Upload a photo of the car'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('dragDrop') || 'Drag & drop or click to select'}
                </p>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative rounded-xl overflow-hidden bg-card border-2 border-border">
              <img src={imagePreview} alt="Uploaded car" className="w-full h-auto max-h-64 object-contain" />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Helper Button - Only shows if photo is uploaded */}
            {!showAiHelper && !aiSuggestions.length && (
              <button
                onClick={() => setShowAiHelper(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                {t('needHelp') || 'Need help choosing? Ask AI'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* STEP 2: MANUAL SELECTION - Checkboxes */}
      <div className="space-y-6">
        {/* Front Lights */}
        <div className="bg-card rounded-2xl p-6 border-2 border-border shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
            <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
            {t('frontLights') || 'Front Lights'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {frontLights.map((light) => (
              <label
                key={light.id}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected(light.id)
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-border hover:border-orange-300 hover:bg-accent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected(light.id)}
                  onChange={() => toggleLight(light.id)}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <span className="font-medium text-foreground">{light.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rear Lights */}
        <div className="bg-card rounded-2xl p-6 border-2 border-border shadow-lg">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
            {t('rearLights') || 'Rear Lights'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rearLights.map((light) => (
              <label
                key={light.id}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected(light.id)
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-border hover:border-red-300 hover:bg-accent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected(light.id)}
                  onChange={() => toggleLight(light.id)}
                  className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                />
                <span className="font-medium text-foreground">{light.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* STEP 3: AI HELPER (Only if user requests help) */}
      {showAiHelper && uploadedImage && (
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border-2 border-purple-500/30 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h3 className="text-lg font-bold text-foreground">
              {t('aiHelperTitle') || 'AI Assistant'}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t('aiHelperDescription') || 'AI will analyze the photo and suggest which lights might be faulty.'}
          </p>

          {/* Analyze Button */}
          {!aiSuggestions.length && (
            <button
              onClick={analyzeImage}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('analyzing') || 'Analyzing...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {t('analyzeButton') || 'Analyze with AI'}
                </>
              )}
            </button>
          )}

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="bg-card rounded-xl p-4 border-2 border-green-500/30">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {t('aiSuggestions') || 'AI Suggestions'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('confidence') || 'Confidence'}: {Math.round((aiConfidence || 0) * 100)}%
                  </p>
                </div>
                <button
                  onClick={applyAllSuggestions}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all"
                >
                  {t('applyAll') || 'Apply All'}
                </button>
              </div>
              <div className="space-y-2">
                {aiSuggestions.map((lightId) => {
                  const light = allLights.find((l) => l.id === lightId);
                  const alreadySelected = isSelected(lightId);
                  return (
                    <div
                      key={lightId}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        alreadySelected ? 'bg-accent' : 'bg-green-500/10'
                      }`}
                    >
                      <span className="font-medium text-foreground">{light?.label}</span>
                      {alreadySelected ? (
                        <span className="text-sm text-muted-foreground">{t('alreadySelected') || 'Already selected'}</span>
                      ) : (
                        <button
                          onClick={() => applySuggestion(lightId)}
                          className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-all"
                        >
                          {t('apply') || 'Apply'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Message */}
          {analysisError && (
            <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 dark:text-red-400">{analysisError}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
