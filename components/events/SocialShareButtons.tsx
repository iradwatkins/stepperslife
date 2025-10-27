"use client";

import { useState } from "react";
import { Facebook, Twitter, Instagram, Link as LinkIcon, Check } from "lucide-react";

interface SocialShareButtonsProps {
  eventName: string;
  eventUrl: string;
  eventDate?: string;
  hasTickets?: boolean;
}

export function SocialShareButtons({ eventName, eventUrl, eventDate, hasTickets }: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const callToAction = hasTickets
    ? "Buy Tickets on SteppersLife.com"
    : "Find more events on SteppersLife.com";

  const shareText = `${eventName}${eventDate ? ' - ' + eventDate : ''}. ${callToAction}`;
  const encodedUrl = encodeURIComponent(eventUrl);
  const encodedText = encodeURIComponent(shareText);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    const width = 600;
    const height = 400;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      shareUrls[platform],
      '_blank',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleInstagramShare = () => {
    // Instagram doesn't have a direct share URL for web
    // Copy link and show message for user to paste in Instagram
    handleCopyLink();
    alert('Link copied! Open Instagram and paste the link in your story or post.');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-600 mr-2">Share:</span>

      <button
        onClick={() => handleShare('facebook')}
        className="flex items-center gap-2 px-3 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166fe5] transition-colors text-sm font-medium"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
        <span className="hidden sm:inline">Facebook</span>
      </button>

      <button
        onClick={() => handleShare('twitter')}
        className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        aria-label="Share on X (Twitter)"
      >
        <Twitter className="w-4 h-4" />
        <span className="hidden sm:inline">X</span>
      </button>

      <button
        onClick={handleInstagramShare}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        aria-label="Share on Instagram"
      >
        <Instagram className="w-4 h-4" />
        <span className="hidden sm:inline">Instagram</span>
      </button>

      <button
        onClick={handleCopyLink}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
          copied
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label="Copy link"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">Copied!</span>
          </>
        ) : (
          <>
            <LinkIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
}
