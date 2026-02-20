import { useState } from 'react';
import { useCreatePhotoPost } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';

export default function CreatePostForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const createPostMutation = useCreatePhotoPost();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }

    if (caption.length > 500) {
      toast.error('Caption must be 500 characters or less');
      return;
    }

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await createPostMutation.mutateAsync({
        photo: blob,
        caption: caption.trim(),
      });

      toast.success('Post created successfully!');
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption('');
      setUploadProgress(0);
    } catch (error) {
      toast.error('Failed to create post');
      console.error('Create post error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="photo">Photo</Label>
        {!previewUrl ? (
          <div className="mt-2">
            <label
              htmlFor="photo"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-rose-300 dark:border-rose-700 rounded-xl cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            >
              <Upload className="w-12 h-12 text-rose-500 mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload an image
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Max 10MB
              </span>
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="mt-2 relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-64 object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={handleRemoveFile}
              className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="caption">Caption (optional)</Label>
        <Textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          maxLength={500}
          rows={3}
          className="mt-2 border-rose-200 dark:border-rose-900 focus:border-rose-500"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {caption.length}/500 characters
        </p>
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={!selectedFile || createPostMutation.isPending}
        className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
      >
        {createPostMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Post...
          </>
        ) : (
          'Create Post'
        )}
      </Button>
    </form>
  );
}
