import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAnalytics } from "@/hooks/use-analytics";
import { Frown, Meh, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

// Supabase Edge Function URL for feedback
const FEEDBACK_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL 
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/smooth-action`
  : 'https://pbibplddrsajieauylcl.supabase.co/functions/v1/smooth-action';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackForm({ isOpen, onClose }: FeedbackFormProps) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const { sessionId, deviceId } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch(FEEDBACK_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          message: message.trim(),
          email: email.trim() || null,
          rating: rating,
          page: window.location.href,
          sessionId: sessionId,
          deviceId: deviceId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setSubmitStatus("success");
      setMessage("");
      setEmail("");
      setRating(null);
      
      // Close after 2 seconds
      setTimeout(() => {
        onClose();
        setSubmitStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage("");
      setEmail("");
      setRating(null);
      setSubmitStatus("idle");
      onClose();
    }
  };

  const ratingOptions = [
    { value: 1, icon: Frown, label: "Poor" },
    { value: 2, icon: Meh, label: "Fair" },
    { value: 3, icon: Smile, label: "Good" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] rounded-lg shadow-2xl backdrop-blur-md border-2 border-[#F4A261]">
        <DialogHeader>
          <DialogTitle>Send Us Feedback / Suggestions</DialogTitle>
          <DialogDescription>
            We'd love to hear your thoughts! Your feedback helps us improve Cup to Grams.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Your feedback *</Label>
            <Textarea
              id="message"
              placeholder="Tell us what you think..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              disabled={isSubmitting}
              className="resize-none border-2 border-[#F4A261] focus:border-[#F4A261] focus:ring-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="border-2 border-[#F4A261] focus:border-[#F4A261] focus:ring-0"
            />
            <p className="text-xs text-muted-foreground">
              Only if you'd like us to follow up with you
            </p>
          </div>

          <div className="space-y-2">
            <Label>How was your experience? (optional)</Label>
            <div className="flex gap-3">
              {ratingOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = rating === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRating(option.value)}
                    disabled={isSubmitting}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      isSelected
                        ? "border-[#F4A261] bg-[#F4A261]/10"
                        : "border-border hover:border-[#F4A261] bg-background"
                    )}
                    title={option.label}
                  >
                    <Icon className={cn(
                      "w-6 h-6",
                      isSelected ? "text-[#C34628]" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-xs font-medium",
                      isSelected ? "text-[#C34628]" : "text-muted-foreground"
                    )}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className={cn(
                "relative px-4 py-5 rounded-lg transition-all duration-200",
                "border-2 border-[#F4A261]",
                "font-semibold text-[#C34628]",
                "cursor-pointer outline-none",
                "hover:bg-[#F4A261]/5 active:bg-[#F4A261]/10",
                "min-h-[48px] text-sm",
                "clickable-button-with-inner-border",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? "Sending..." : "Send Feedback"}
            </button>
          </DialogFooter>

          {submitStatus === "success" && (
            <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-sm">
              Thank you! Your feedback has been submitted.
            </div>
          )}

          {submitStatus === "error" && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm">
              Something went wrong. Please try again later.
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

