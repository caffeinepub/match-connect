import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import ProfileForm from './ProfileForm';
import { useState } from 'react';

export default function ProfileSetupModal() {
  const [open, setOpen] = useState(true);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
            Welcome to Match Connect!
          </DialogTitle>
          <DialogDescription>
            Let's create your profile to get started. Tell us about yourself to find your perfect match.
          </DialogDescription>
        </DialogHeader>
        <ProfileForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
