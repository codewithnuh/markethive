import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const footerLinks = [
  {
    title: "Shop",
    links: ["All Products", "New Arrivals", "Best Sellers", "Deals"],
  },
  {
    title: "About",
    links: ["Our Story", "Careers", "Press", "Blog"],
  },
  {
    title: "Support",
    links: ["FAQs", "Contact Us", "Shipping", "Returns"],
  },
  {
    title: "Legal",
    links: ["Terms of Service", "Privacy Policy", "Cookie Policy"],
  },
];

export function Footer() {
  return (
    <footer className="bg-background border-t mt-10">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <h2 className="mb-6 text-sm font-semibold text-foreground uppercase">
              Stay Connected
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Subscribe to our newsletter for exclusive offers and updates.
            </p>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="max-w-xs"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-8 lg:col-span-2 lg:grid-cols-4">
            {footerLinks.map((category) => (
              <div key={category.title}>
                <h2 className="mb-6 text-sm font-semibold text-foreground uppercase">
                  {category.title}
                </h2>
                <ul className="text-muted-foreground">
                  {category.links.map((link) => (
                    <li key={link} className="mb-4">
                      <Link
                        href="/#"
                        className="hover:underline hover:text-foreground transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-between pt-8 mt-8 border-t border-muted md:flex-row">
          <p className="mb-4 text-sm text-muted-foreground md:mb-0">
            &copy; 2025 Your E-commerce Store. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              href="/#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="sr-only">Facebook</span>
              <Facebook className="w-6 h-6" />
            </Link>
            <Link
              href="/#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="sr-only">Instagram</span>
              <Instagram className="w-6 h-6" />
            </Link>
            <Link
              href="/#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="sr-only">Twitter</span>
              <Twitter className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
