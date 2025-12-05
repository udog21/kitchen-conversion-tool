import { Link } from "wouter";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useState } from "react";

/**
 * Content style guide: See design_guidelines.md "Content Style Guide" section
 * for section title formatting rules and page title hierarchy guidelines.
 */
export default function About() {
  const [copied, setCopied] = useState(false);
  const email = "contact@cuptograms.com";

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">About Us</h1>
        </div>
        
        <Link href="/" data-testid="link-home">
          <button 
            className="relative flex items-center gap-2 text-[#C34628] mb-6 px-4 py-3 rounded-lg border-2 border-[#F4A261] font-semibold hover:bg-[#F4A261]/5 active:bg-[#F4A261]/10 transition-all clickable-button-with-inner-border"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Converter
          </button>
        </Link>

        <article className="prose dark:prose-invert max-w-none">
          <div className="space-y-6 text-foreground">
            <p className="leading-relaxed">
              CupToGrams is a lightweight and mobile-friendly measurement converter and ingredient substitution tool for home cooks and bakers who want information quickly without slowing down their workflow.
            </p>

            <p className="leading-relaxed">
              We are home bakers who like to try out recipes from other countries, and who often run out of buttermilk and other ingredients.
               We found existing conversion websites too cumbersome to navigate and filled with content not relevant in the kitchen, 
               so we created this purpose-built tool to make our baking a little bit easier. We love using our knuckles to tap on those large CupToGrams buttons. No more fiddling with a keyboard or phone buttons with sticky or flour-covered fingers.
            </p>

            <p className="leading-relaxed">
              Our work is not yet done. We intend to continually improve CupToGrams, including adding more ingredients, testing conversions, and expanding its library of substitutions. If you have any feedback or suggestions, we would love to hear from you. Contact us at:
            </p>

            <div className="mt-4">
              <a 
                href={`mailto:${email}`}
                className="text-link hover:underline"
                data-testid="link-contact-email"
              >
                {email}
              </a>
              <div className="mt-3">
                <button
                  onClick={handleCopyEmail}
                  className="relative flex items-center gap-2 text-[#C34628] px-4 py-3 rounded-lg border-2 border-[#F4A261] font-semibold hover:bg-[#F4A261]/5 active:bg-[#F4A261]/10 transition-all clickable-button-with-inner-border"
                  data-testid="button-copy-email"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy email address
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

