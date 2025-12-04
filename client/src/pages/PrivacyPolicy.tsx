import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import kitchenScaleIcon from "@assets/Cuptograms icon_180x180_1759434142149.png";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src={kitchenScaleIcon} 
              alt="Kitchen Scale Icon" 
              className="w-10 h-10"
            />
            <h1 className="text-2xl font-bold text-foreground">Cup to Grams Privacy Policy</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-[52px]">Effective date: 3 December 2025</p>
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
          <div className="space-y-6 text-foreground">
            <p className="leading-relaxed">
              Your privacy is important to us. This Privacy Policy explains what information we 
              collect when you use CupToGrams, how we use it, and what choices you have
              regarding your data.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Information we collect
              </h2>
              <p className="leading-relaxed mb-4">
                CupToGrams does not require you to create an account nor submit personal details to 
                use our conversion tools. However, like most websites, we automatically collect certain 
                information, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Your IP address</li>
                <li>Your browser type and version</li>
                <li>Your device type and operating system</li>
                <li>Pages you visited and time spent on the site</li>
                <li>Referring URLs</li>
              </ul>
              <p className="leading-relaxed mt-4">
                This data helps us understand how visitors use the site and how we can improve the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Cookies and advertising
              </h2>
              <p className="leading-relaxed mb-4">
                CupToGrams uses cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Remember user preferences</li>
                <li>Improve site performance</li>                
                <li>Serve relevant ads</li>
              </ul>
              <p className="leading-relaxed mt-4">
                The site uses Google Adsense to display ads. Google and its partners 
                may use cookies (including the DoubleClick cookie) to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Show personalized ads based on your visits to this and other websites</li>
                <li>Limit how often you see ads</li>                
                <li>Measure ad performance</li>
              </ul>
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
              <p className="leading-relaxed mt-4">
                You may also visit {" "} 
                <a 
                  href="https://youradchoices.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  data-testid="link-google-ads-settings"
                >
                  YourAdChoices
                </a>
                {" "} to opt out of third-party vendors' use of cookies for personalized advertising.
              </p>            
              <p className="leading-relaxed mt-4">
                For more details on how Google uses data when you visit sites using its service, please see{" "}
                <a 
                  href="https://policies.google.com/technologies/partner-sites" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  data-testid="link-google-ads-settings"
                >
                  https://policies.google.com/technologies/partner-sites
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Analytics and third-party services
              </h2>
              <p className="leading-relaxed">
              We may use analytics tools (such as Google Analytics or similar services) 
              to help us understand how visitors use the site.
              </p>
              <p className="leading-relaxed">
              These services collect information sent by your browser as part of a web request, including 
              cookies and your IP address. Third-party services have their own privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                How we use your information
              </h2>
              <p className="leading-relaxed mb-4">
                We use the information collected to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Operate and maintain the website</li>
                <li>Improve the site's performance and content</li>                
                <li>Analyze traffic and usage trends</li>
                <li>Display relevant ads</li>
              </ul>
              <p className="leading-relaxed mt-4">
                We do not sell nor share your personal information with third parties for 
                their own marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Your choices
              </h2>
              <p className="leading-relaxed mt-4">
                You can control or disable cookies through your browser settings.
              </p>
              <p className="leading-relaxed mt-4">
                You may opt out of Google interest-based advertising here: {" "}
                <a 
                  href="https://www.google.com/settings/ads" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  data-testid="link-google-ads-settings"
                >
                  https://www.google.com/settings/ads
                </a>
              </p>            
              <p className="leading-relaxed mt-4">
                You may opt out of other third-party personalized ads here: {" "}
                <a 
                  href="https://www.aboutads.info/choices/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  data-testid="link-google-ads-settings"
                >
                  https://www.aboutads.info/choices/
                </a>
              </p>
              <p className="leading-relaxed mt-4">
                If you disable cookies, some features may not function as expected.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Changes to this policy
              </h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. Any changes will be posted on this 
                page with a new effective date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                Contact
              </h2>
              <p className="leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:{" "}
                <a 
                  href="mailto:helmut.edissy@gmail.com" 
                  className="text-primary hover:underline"
                  data-testid="link-contact-email"
                >
                  contact@cuptograms.com
                </a>
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
