import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import kitchenScaleIcon from "@assets/ChatGPT Image Oct 2, 2025, 12_04_24 PM_1759431939694.png";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <img 
            src={kitchenScaleIcon} 
            alt="Kitchen Scale Icon" 
            className="w-10 h-10"
          />
          <h1 className="text-2xl font-bold text-foreground">Cup to Grams Privacy Policy</h1>
        </div>
        
        <Link href="/" data-testid="link-home">
          <button 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 hover-elevate px-3 py-2 rounded-lg"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Converter
          </button>
        </Link>

        <article className="prose dark:prose-invert max-w-none">
          <h2 className="text-3xl font-bold text-foreground mb-8" data-testid="text-privacy-title">
            Privacy Policy
          </h2>

          <div className="space-y-6 text-foreground">
            <p className="leading-relaxed">
              Your privacy is important to us. This Privacy Policy explains what information we 
              collect when you use this website, how we use it, and how you can control your 
              information.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Information We Collect
              </h2>
              <p className="leading-relaxed mb-4">
                This website does not require you to create an account or provide personal details to 
                use our conversion tools. However, like most websites, we automatically collect certain 
                information such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Your IP address</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent on the site</li>
              </ul>
              <p className="leading-relaxed mt-4">
                This information helps us understand how visitors use the site and improve the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Cookies and Advertising
              </h2>
              <p className="leading-relaxed mb-4">
                We may use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Remember your preferences</li>
                <li>Provide relevant ads through services like Google AdSense</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Third-party vendors, including Google, use cookies to serve ads based on your visits 
                to this and other websites.
              </p>
              <p className="leading-relaxed mt-4">
                Google's use of the DoubleClick cookie enables it and its partners to serve ads based 
                on your visit to this site and other sites on the Internet.
              </p>
              <p className="leading-relaxed mt-4">
                You may opt out of personalized advertising by visiting{" "}
                <a 
                  href="https://www.google.com/settings/ads" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  data-testid="link-google-ads-settings"
                >
                  Google Ads Settings
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Third-Party Services
              </h2>
              <p className="leading-relaxed">
                This website may include third-party services (such as analytics or advertising 
                networks) that collect, monitor, and analyze data to help us operate and improve the 
                site. These third parties have their own privacy policies, and we encourage you to 
                review them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                How We Use Your Information
              </h2>
              <p className="leading-relaxed mb-4">
                We use the information collected to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Maintain and improve the website</li>
                <li>Monitor traffic and usage trends</li>
                <li>Display relevant advertisements</li>
              </ul>
              <p className="leading-relaxed mt-4">
                We will never sell, rent, or share your personal information with third parties for 
                marketing purposes without your consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Your Choices
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>You can disable cookies in your browser settings if you prefer not to allow them.</li>
                <li>
                  You may also opt out of third-party personalized ads at{" "}
                  <a 
                    href="https://www.aboutads.info" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    data-testid="link-aboutads"
                  >
                    www.aboutads.info
                  </a>
                  .
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Changes to This Policy
              </h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. Updates will be posted on this 
                page with a new effective date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Contact Us
              </h2>
              <p className="leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="leading-relaxed mt-2">
                Email:{" "}
                <a 
                  href="mailto:helmut.edissy@gmail.com" 
                  className="text-primary hover:underline"
                  data-testid="link-contact-email"
                >
                  helmut.edissy@gmail.com
                </a>
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
