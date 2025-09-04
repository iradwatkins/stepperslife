'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { 
  Share2, 
  Copy, 
  Mail, 
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Send,
  CheckCircle
} from 'lucide-react';

interface AffiliateSocialShareProps {
  event: {
    _id: Id<"events">;
    name: string;
    eventDate: number;
    venue: string;
    price: number;
    imageUrl?: string;
  };
  affiliate: {
    _id: Id<"affiliatePrograms">;
    referralCode: string;
    affiliateName: string;
    commissionPerTicket: number;
  };
}

export default function AffiliateSocialShare({ event, affiliate }: AffiliateSocialShareProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState<string | null>(null);
  
  const trackShare = useMutation(api.affiliates.trackAffiliateShare);
  
  // Build the referral URL
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://stepperslife.com';
  const referralUrl = `${baseUrl}/event/${event._id}?ref=${affiliate.referralCode}`;
  
  // Build share message
  const shareTitle = `${event.name} - Get Your Tickets!`;
  const shareText = `🎫 Join me at ${event.name}! Save $${affiliate.commissionPerTicket} on tickets with my special link. Don't miss out! 🎉`;
  
  const handleShare = async (platform: 'whatsapp' | 'facebook' | 'twitter' | 'email' | 'other') => {
    setSharing(platform);
    
    try {
      // Track the share
      await trackShare({
        affiliateId: affiliate._id,
        platform,
      });
      
      // Open share dialog based on platform
      let shareUrl = '';
      
      switch (platform) {
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + referralUrl)}`;
          break;
        
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}&quote=${encodeURIComponent(shareText)}`;
          break;
        
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(shareText)}`;
          break;
        
        case 'email':
          shareUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + referralUrl)}`;
          break;
        
        default:
          // Use native share API if available
          if (navigator.share) {
            await navigator.share({
              title: shareTitle,
              text: shareText,
              url: referralUrl,
            });
          } else {
            // Fallback to copying link
            await copyToClipboard();
          }
          setSharing(null);
          return;
      }
      
      // Open in new window/tab
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
      
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Share failed",
        description: "Please try copying the link instead",
        variant: "destructive",
      });
    }
    
    setSharing(null);
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share it anywhere to earn commissions",
      });
      
      // Track as 'other' platform
      await trackShare({
        affiliateId: affiliate._id,
        platform: 'other',
      });
      
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please select and copy the link manually",
        variant: "destructive",
      });
    }
  };
  
  // Format event date
  const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share Your Referral Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview Section */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Preview how your link will appear:
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
            {event.imageUrl && (
              <img 
                src={event.imageUrl} 
                alt={event.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                  {affiliate.affiliateName} invites you!
                </span>
              </div>
              <h3 className="font-bold text-lg mb-1">{event.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {eventDate} at {event.venue}
              </p>
              <p className="text-sm font-semibold text-green-600">
                Save ${affiliate.commissionPerTicket} with this special link!
              </p>
            </div>
          </div>
        </div>
        
        {/* Share Buttons Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleShare('whatsapp')}
            disabled={sharing === 'whatsapp'}
            className="flex items-center gap-2 h-12"
          >
            <MessageCircle className="w-5 h-5 text-green-600" />
            WhatsApp
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('facebook')}
            disabled={sharing === 'facebook'}
            className="flex items-center gap-2 h-12"
          >
            <Facebook className="w-5 h-5 text-blue-600" />
            Facebook
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('twitter')}
            disabled={sharing === 'twitter'}
            className="flex items-center gap-2 h-12"
          >
            <Twitter className="w-5 h-5 text-sky-500" />
            Twitter
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleShare('email')}
            disabled={sharing === 'email'}
            className="flex items-center gap-2 h-12"
          >
            <Mail className="w-5 h-5 text-gray-600" />
            Email
          </Button>
        </div>
        
        {/* Copy Link Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Direct Link
          </label>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm font-mono overflow-x-auto">
              {referralUrl}
            </div>
            <Button
              variant={copied ? "default" : "outline"}
              size="sm"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Commission Info */}
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💰 <strong>You earn ${affiliate.commissionPerTicket}</strong> for every ticket sold through your link!
          </p>
        </div>
        
        {/* Native Share Button (for mobile) */}
        {typeof window !== 'undefined' && navigator.share && (
          <Button
            onClick={() => handleShare('other')}
            className="w-full"
            variant="default"
          >
            <Send className="w-4 h-4 mr-2" />
            Share via Other Apps
          </Button>
        )}
      </CardContent>
    </Card>
  );
}