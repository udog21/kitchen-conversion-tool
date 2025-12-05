import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Blog</h1>
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
          <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-blog-title">
            Introducing Cup to Grams: A Simple Tool for Everyday Baking
          </h2>
          <p className="text-muted-foreground mb-8" data-testid="text-blog-date">Oct 2025</p>

          <div className="space-y-4 text-foreground leading-relaxed">
            <p>
              As a home baker, I've lost count of the number of times I've pulled out my phone 
              mid-recipe to check a measurement conversion. One recipe might call for a cup of flour, 
              another for 120 grams, and a third might list everything in tablespoons. While cups and 
              spoons are common in recipes, others rely entirely on weight. Switching back and forth 
              quickly becomes frustrating, especially when accuracy is the difference between a perfect 
              sponge and a dense disappointment.
            </p>

            <p>
              Volume-to-weight conversions have always been the trickiest. A "cup" isn't a universal 
              standard — U.S., U.K., and Australian cups all measure slightly differently, and 
              ingredients themselves vary. A cup of flour doesn't weigh the same as a cup of sugar, 
              and that doesn't even touch liquids, syrups, or sticky ingredients. I wanted a fast, 
              reliable way to translate between systems without flipping through books, scrolling 
              endless Google results, or relying on conversion calculators that require multiple clicks.
            </p>

            <p>
              That's why I built this app. It's a simple, lightweight tool designed to solve one very 
              specific problem: giving bakers and cooks a quick way to convert common kitchen 
              measurements. Whether you're moving from liters to cups, grams to ounces, or just trying 
              to figure out what a tablespoon of butter weighs, you'll be able to find an answer in 
              seconds. My goal was to make it clean, mobile-friendly, and distraction-free so you can 
              use it right at the counter without juggling tabs.
            </p>

            <p>
              Over time, I'll continue expanding the app to include more ingredients, regional 
              standards, and even tips for making substitutions in a pinch. Baking is already enough of 
              a science experiment — measurement shouldn't be the stumbling block that holds you back.
            </p>

            <p>
              I hope you find this tool as useful in your kitchen as I have in mine. If you have 
              suggestions, notice a missing conversion, or want to share how you're using it, I'd love 
              to hear from you. After all, the best recipes are shared, tested, and improved together.
            </p>

            <p className="font-medium">
              Happy baking, and may your next loaf, cake, or cookie turn out just the way you imagined!
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
