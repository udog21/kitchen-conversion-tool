import { Link } from "wouter";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useState } from "react";

/**
 * Content style guide: See design_guidelines.md "Content Style Guide" section
 * for section title formatting rules and page title hierarchy guidelines.
 */
export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Effective 4 December 2025</p>
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
              By accessing or using this website, you agree to the following Terms of Service. If you do not agree with these terms, please do not use the site.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Use of the website
              </h2>
              <p className="leading-relaxed mb-4">
                CupToGrams provides cooking measurement conversion tools, informational content, and related resources. You may use the site for personal, non-commercial purposes.
              </p>
              <p className="leading-relaxed mb-4">
                You agree:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Not to use the site for any unlawful purpose</li>
                <li>Not to attempt to disrupt or damage the website or its infrastructure</li>
                <li>Not to copy, scrape, or redistribute content without permission</li>
              </ul>
              <p className="leading-relaxed mt-4">
                We reserve the right to modify, suspend, or discontinue any part of the website at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Accuracy of information
              </h2>
              <p className="leading-relaxed mb-4">
                While we strive to provide accurate conversion information and content, CupToGrams makes no guarantees regarding accuracy, completeness, or fitness for any purpose.
              </p>
              <p className="leading-relaxed mb-4">
                Use the information at your own risk.
              </p>
              <p className="leading-relaxed">
                CupToGrams is not responsible for any losses or damages resulting from reliance on the site's content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Intellectual property
              </h2>
              <p className="leading-relaxed mb-4">
                All content on this website—including text, graphics, logos, icons, and design—is the property of CupToGrams or its content creators and is protected by copyright and intellectual property laws.
              </p>
              <p className="leading-relaxed">
                You may not reproduce, distribute, or modify any part of the website without prior written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Third-party links and services
              </h2>
              <p className="leading-relaxed mb-4">
                This website may include links to third-party websites or use third-party services such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Google AdSense</li>
                <li>Analytics tools</li>
                <li>Embedded content or widgets</li>
              </ul>
              <p className="leading-relaxed mt-4">
                These third parties have their own terms and privacy policies. We are not responsible for their content, practices, or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Advertising, cookies, and analytics
              </h2>
              <p className="leading-relaxed mb-4">
                CupToGrams displays third-party advertisements, including Google AdSense. Advertisers may use cookies and tracking technologies to deliver personalized ads.
              </p>
              <p className="leading-relaxed mb-4">
                Use of this site constitutes your agreement that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Third-party vendors may place and read cookies in your browser</li>
                <li>Google may use cookies (including the DoubleClick cookie) to serve ads based on your visits to this and other websites</li>
                <li>CupToGrams may store a device identifier in your browser's local storage for analytics purposes</li>
                <li>We may collect and analyze usage data, including session information and conversion events, to improve our service</li>
              </ul>
              <p className="leading-relaxed mt-4">
                For more information about how Google uses data, visit:{" "}
                <a 
                  href="https://policies.google.com/technologies/partner-sites" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-link hover:underline"
                >
                  https://policies.google.com/technologies/partner-sites
                </a>
              </p>
              <p className="leading-relaxed mt-4">
                See our{" "}
                <Link href="/privacy" className="text-link hover:underline">
                  Privacy Policy
                </Link>
                {" "}for full details about data collection and your rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Disclaimer of warranties
              </h2>
              <p className="leading-relaxed mb-4">
                This website is provided "as is" and "as available."
              </p>
              <p className="leading-relaxed mb-4">
                CupToGrams disclaims all warranties, express or implied, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Merchantability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Accuracy or reliability of content</li>
              </ul>
              <p className="leading-relaxed mt-4">
                We do not guarantee uninterrupted or error-free service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Limitation of liability
              </h2>
              <p className="leading-relaxed mb-4">
                To the fullest extent permitted by law, CupToGrams is not liable for any direct, indirect, incidental, consequential, or special damages arising out of or related to your use of the website.
              </p>
              <p className="leading-relaxed mb-4">
                This includes, but is not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Data loss</li>
                <li>Business interruption</li>
                <li>Financial loss</li>
                <li>Misuse of information</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Your sole remedy for dissatisfaction with the site is to stop using it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Changes to these terms
              </h2>
              <p className="leading-relaxed">
                We may update these Terms of Service at any time. Updates will be posted on this page with a new effective date. Continued use of the website constitutes acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Governing law
              </h2>
              <p className="leading-relaxed">
                These Terms are governed by the laws of the State of Washington, USA, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Contact
              </h2>
              <p className="leading-relaxed mb-4">
                If you have questions about these Terms, please contact us at:
              </p>
              <div>
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
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}

