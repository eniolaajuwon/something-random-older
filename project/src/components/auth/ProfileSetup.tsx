import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCircle, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadAvatar } from '@/lib/storage-utils';

interface ProfileData {
  displayName: string;
  avatar: string | null;
  datePreference: string;
  interests: string;
  budget: string;
}

interface Props {
  onComplete: () => void;
}

export function ProfileSetup({ onComplete }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    displayName: '',
    avatar: null,
    datePreference: '',
    interests: '',
    budget: '',
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setUploading(true);
      try {
        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Supabase
        const publicUrl = await uploadAvatar(file, user.id);
        if (publicUrl) {
          setFormData(prev => ({ ...prev, avatar: publicUrl }));
        }
      } catch (error) {
        console.error('Error handling avatar:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save profile data
      if (user) {
        const profileData: ProfileData = {
          ...formData,
          avatar: formData.avatar // Use the stored URL, not the preview
        };
        localStorage.setItem('user_profile', JSON.stringify(profileData));
      }
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-300">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Help us personalize your experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="w-16 h-16 text-purple-400" />
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className={`absolute bottom-0 right-0 p-1 bg-purple-600 rounded-full cursor-pointer hover:bg-purple-700 transition-colors ${uploading ? 'pointer-events-none' : ''}`}>
                    {uploading ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="How should we call you?"
                  className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="datePreference">Preferred Date Type</Label>
                <Select
                  value={formData.datePreference}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, datePreference: value }))}
                >
                  <SelectTrigger className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adventure">Adventure & Outdoors</SelectItem>
                    <SelectItem value="culture">Arts & Culture</SelectItem>
                    <SelectItem value="food">Food & Dining</SelectItem>
                    <SelectItem value="relaxation">Relaxation & Wellness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interests">Interests</Label>
                <Input
                  id="interests"
                  value={formData.interests}
                  onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                  placeholder="e.g., hiking, art, music, cooking"
                  className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Typical Budget for Dates</Label>
                <Select
                  value={formData.budget}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}
                >
                  <SelectTrigger className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80">
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget-Friendly (Under $50)</SelectItem>
                    <SelectItem value="moderate">Moderate ($50-$150)</SelectItem>
                    <SelectItem value="upscale">Upscale ($150-$300)</SelectItem>
                    <SelectItem value="luxury">Luxury ($300+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleNext}
              disabled={uploading}
              className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white"
            >
              {step === 3 ? 'Complete Setup' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}