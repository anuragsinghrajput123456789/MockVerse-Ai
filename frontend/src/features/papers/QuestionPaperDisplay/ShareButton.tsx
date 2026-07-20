import React from 'react';
import { Share2 } from 'lucide-react';
import { useToast } from '../../../shared/hooks/use-toast';

interface ShareButtonProps {
  title: string;
  url?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ title, url = window.location.href }) => {
  const { toast } = useToast();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this question paper: ${title}`,
          url
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied!",
          description: "Paper URL copied to your clipboard.",
        });
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 text-indigo-400 hover:text-indigo-300 rounded-xl transition-all duration-300 text-xs font-bold flex items-center gap-2"
    >
      <Share2 className="w-4 h-4" />
      <span>Share Link</span>
    </button>
  );
};

export default ShareButton;
