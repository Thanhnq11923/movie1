"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { Card, CardContent } from "./card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import { MainLayout } from "../../../../layouts/Layout";

const ruleCategories = [
  {
    id: "general-terms",
    title: "I. General Terms",
    content:
      "By accessing and using our website, you agree to comply with the following rules and policies. These terms govern your use of our services, including ticket booking, payments, account usage, and customer support. The cinema reserves the right to update these terms at any time without prior notice.",
  },
  {
    id: "ticket-booking",
    title: "II. Ticket Booking Policy",
    content:
      "• Tickets must be booked in advance through our official website or authorized platforms.\n• A ticket is only confirmed upon successful payment and receipt of a confirmation email or SMS.\n• Seat selection depends on real-time availability at the time of booking.\n• Customers are responsible for verifying the movie title, showtime, and seat details before completing payment.",
  },
  {
    id: "payment-policy",
    title: "III. Payment Policy",
    content:
      "• We support payment methods including credit/debit cards, digital wallets, and other listed gateways.\n• All transactions are encrypted and securely processed through certified providers.\n• We do not store any payment information on our servers.",
  },
  {
    id: "cancellation-refund",
    title: "IV. Cancellation and Refund Policy",
    content:
      "• All ticket purchases are final, except when the cinema cancels or reschedules a screening.\n• In special cases (e.g., double bookings, payment errors), refund requests must be submitted within 24 hours for review.\n• The cinema does not provide refunds for late arrivals or no-shows.",
  },
  {
    id: "user-account",
    title: "V. User Account Policy",
    content:
      "• Users must register with accurate and valid personal information.\n• Each user is responsible for their account security and related activities.\n• The cinema reserves the right to suspend or deactivate accounts involved in fraud, abuse, or policy violations.",
  },
  {
    id: "acceptable-use",
    title: "VI. Acceptable Use Policy",
    content:
      "Users agree not to:\n• Disrupt or interfere with the normal operation of the website.\n• Attempt unauthorized access to other user accounts or restricted system areas.\n• Use bots or scripts to automate bookings or abuse promotions.\n\nViolations may result in account suspension and/or legal action.",
  },
  {
    id: "theater-admission",
    title: "VII. Theater Admission Policy",
    content:
      "Customers who have paid in advance are allowed to enter the auditorium at any point during the screening of the film. However, to ensure the best experience for all guests, please note:\n• Late entry should be quiet and minimize disruption to other viewers.\n• Please follow staff instructions when entering after the film has started.\n• The cinema is not responsible for any missed content due to late arrival.",
  },
  {
    id: "promotions-discounts",
    title: "VIII. Promotions and Discounts",
    content:
      "• Promo codes and discounts are subject to availability and may change.\n• Multiple promotions cannot be combined unless explicitly stated.\n• Abuse of promotions may result in order cancellation or account suspension.",
  },
  {
    id: "privacy-data",
    title: "IX. Privacy and Data Protection",
    content:
      "• We are committed to protecting user privacy. Personal data is used solely for booking, customer service, and communication purposes.\n• All data is securely stored and will not be shared with third parties without user consent, except as required by law.\n• Please refer to our [Privacy Policy] for full details.",
  },
  {
    id: "customer-support",
    title: "X. Customer Support",
    content:
      "For assistance with bookings, payments, or technical issues, please contact us:\n📞 Hotline: 1900 123 456 (8:00 AM – 10:00 PM daily)\n📧 Email: support@yourcinema.com\n💬 Live Chat: Available on the website",
  },
  {
    id: "policy-updates",
    title: "XI. Policy Updates",
    content:
      "These policies may be updated periodically. Continued use of our website and services implies acceptance of the latest terms.",
  },
];

interface AccordionItemProps {
  category: (typeof ruleCategories)[0];
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ category, isOpen, onToggle }: AccordionItemProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <CollapsibleTrigger
          className="flex w-full items-center justify-between bg-gray-50 p-3 sm:p-4 text-left hover:bg-gray-100 transition-colors duration-200"
          onClick={handleClick}
        >
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 pr-4">
            {category.title}
          </h3>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-3 sm:p-4 bg-white">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {category.content}
            </p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default function RulePage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [hasOpenSections, setHasOpenSections] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Kiểm tra nếu đã cuộn đến cuối trang (với một khoảng nhỏ 100px)
      setIsAtBottom(documentHeight - (scrollPosition + windowHeight) < 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToPosition = (position: "top" | "bottom") => {
    window.scrollTo({
      top: position === "top" ? 0 : document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  const toggleSection = (categoryId: string) => {
    setOpenSections((prev) => {
      const newState = {
        ...prev,
        [categoryId]: !prev[categoryId],
      };

      // Check if any section is open
      const hasAnyOpen = Object.values(newState).some(Boolean);
      setHasOpenSections(hasAnyOpen);

      return newState;
    });
  };

  const toggleAll = () => {
    if (hasOpenSections) {
      // If any sections are open, collapse all
      setOpenSections({});
      setHasOpenSections(false);
    } else {
      // If no sections are open, expand all
      const allOpen = ruleCategories.reduce((acc, category) => {
        acc[category.id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setOpenSections(allOpen);
      setHasOpenSections(true);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 pt-10">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pt-20 sm:pt-24">
          {/* Header Section */}
          <Card className="mb-6 sm:mb-8">
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Rules</h1>

                {/* Toggle All Button */}
                <button
                  onClick={toggleAll}
                  className="px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-sm sm:text-base"
                >
                  {hasOpenSections ? (
                    <>
                      <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200" />
                      <span>Collapse All</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200" />
                      <span>Expand All</span>
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Main Card */}
          <Card>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {ruleCategories.map((category) => (
                  <AccordionItem
                    key={category.id}
                    category={category}
                    isOpen={openSections[category.id] || false}
                    onToggle={() => toggleSection(category.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-500">Last updated: May 2025</p>
          </div>
        </div>

        {/* Scroll Button */}
        <button
          onClick={() => scrollToPosition(isAtBottom ? "top" : "bottom")}
          className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-400 text-white shadow-lg hover:bg-yellow-500 transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 z-50"
          aria-label={isAtBottom ? "Scroll to top" : "Scroll to bottom"}
        >
          {isAtBottom ? (
            <ChevronUp className="h-4 w-4 sm:h-6 sm:w-6" />
          ) : (
            <ChevronDown className="h-4 w-4 sm:h-6 sm:w-6" />
          )}
        </button>
      </div>
    </MainLayout>
  );
}
