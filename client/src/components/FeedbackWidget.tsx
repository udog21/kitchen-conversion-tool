import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { FeedbackForm } from "@/components/FeedbackForm";

export function FeedbackWidget() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsFormOpen(true)}
        className="feedback-widget-button"
        aria-label="Send feedback"
        data-testid="feedback-widget-button"
      >
        <MessageSquare className="w-6 h-6 text-[#C34628]" />
      </button>
      <FeedbackForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </>
  );
}

