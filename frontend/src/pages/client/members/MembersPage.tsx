import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { MainLayout } from "../../../layouts/Layout"

export default function Members() {
  const [activeSection, setActiveSection] = useState("birthday-gifts")
  const [expandedLevel, setExpandedLevel] = useState("u22-members")

  const toggleLevel = (level: string) => {
    if (expandedLevel === level) {
      setExpandedLevel("")
    } else {
      setExpandedLevel(level)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 mt-20">

      {/* Header */}
      <div className="text-center mb-25">
        <h1 className="text-6xl font-black text-black mb-6 tracking-wider">MEMBERSHIP</h1>
        {/* <div className="flex justify-center items-center gap-2">
          <div className="h-px bg-gray-300 flex-1 max-w-xs"></div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <div className="h-px bg-gray-300 flex-1 max-w-xs"></div>
        </div> */}
      </div>

      {/* Navigation Buttons */}
      {/* Navigation Buttons */}
      <div className="flex justify-center gap-8 mb-12 border-b border-gray-200">
        <button
          className={`${activeSection === "birthday-gifts" ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent"} font-medium pb-4 px-6 border-b-2 transition-colors duration-200 hover:text-blue-600`}
          onClick={() => setActiveSection("birthday-gifts")}
        >
          BIRTHDAY GIFTS
        </button>
        <button
          className={`${activeSection === "account-management" ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent"} font-medium pb-4 px-6 border-b-2 transition-colors duration-200 hover:text-blue-600`}
          onClick={() => setActiveSection("account-management")}
        >
          ACCOUNT MANAGEMENT
        </button>
        <button
          className={`${activeSection === "support" ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent"} font-medium pb-4 px-6 border-b-2 transition-colors duration-200 hover:text-blue-600`}
          onClick={() => setActiveSection("support")}
        >
          SUPPORT
        </button>
        <button
          className={`${activeSection === "membership-levels" ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent"} font-medium pb-4 px-6 border-b-2 transition-colors duration-200 hover:text-blue-600`}
          onClick={() => setActiveSection("membership-levels")}
        >
          MEMBERSHIP LEVELS
        </button>
      </div>

      {/* Content Sections */}
      {activeSection === "birthday-gifts" && (
        <div className="animate-fadeIn">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative">
              <img
                src="/public/members/membership.png?height=256&width=400"
                alt="Birthday Gift Image"
                className="rounded-lg object-cover w-full h-64 shadow-md"
              />
              {/* Detailed Information */}
              <div className="mt-8 space-y-6 text-sm text-gray-700">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {/* <span className="text-yellow-600 text-lg">📋</span> */}
                    <h4 className="font-bold text-black">Eligibility Conditions:</h4>
                  </div>
                  <p className="mb-2 font-medium">Members must meet one of the following:</p>
                  <div className="space-y-2 ml-4">
                    <p className="leading-relaxed">
                      <span className="font-semibold">1.</span> Purchased tickets/popcorn/gift cards at ONYX or via the
                      Website/App within the past 24 months (excluding the same birthday month from 2 years prior).
                    </p>
                    <p className="leading-relaxed">
                      <span className="font-semibold">2.</span> No transactions in the past 24 months? Just make a
                      purchase now to receive the gift.
                    </p>
                    <p className="leading-relaxed">
                      <span className="font-semibold">3.</span> New members who make a purchase can redeem the gift
                      immediately.
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {/* <span className="text-yellow-600 text-lg">🎁</span> */}
                    <h4 className="font-bold text-black">How to Redeem:</h4>
                  </div>
                  <p className="mb-2 font-medium">At any ONYX theater counter, present:</p>
                  <div className="space-y-1 ml-4">
                    <p className="leading-relaxed">-(1) ID/VNeID or document/photo showing date of birth</p>
                    <p className="leading-relaxed">-(2) ONYX Hard Card or App with logged-in account</p>
                  </div>
                  <p className="mt-2 font-medium mb-10">
                    Staff may deny the request if documents or info do not match the member account.
                  </p>
                </div>
              </div>
              {/* Image */}
            <div className="relative">
              <img
                src="/public/members/birthdaygift.png"
                alt="Birthday Gift Image"
                className="rounded-lg object-cover w-full h-full shadow-md"
              />
            </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="mb-20">
                <div className="flex items-center gap-2 mb-2">
                  {/* <div className="w-4 h-4 bg-red-500 rounded-full"></div> */}
                  <h3 className="font-bold text-black">ONYX Birthday Gift Policy</h3>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  {/* <div className="w-4 h-4 bg-gray-400 rounded-full"></div> */}
                  <span className="text-gray-700">Gift by Membership Tier:</span>
                </div>

                <div className="space-y-2 text-sm text-gray-700 ml-6">
                  <p>-Close & U22: 01 ONYX Birthday</p>
                  <p>-VIP: 01 Combo + 01 2D/3D Movie</p>
                  <p>-VVIP: 01 Combo + 02 2D/3D Movie Tickets</p>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  {/* <div className="w-4 h-4 bg-yellow-500 rounded-full"></div> */}
                  <span className="text-sm text-gray-700">U22 members turning 23 get 1 extra 2D/3D ticket.</span>
                </div>
                <p className="text-sm text-gray-700 ml-6">
                  ONYX Birthday Combo = 1 Sweet Corn (44oz) + 2 Soft Drinks (22oz)
                </p>
              </div>
              
              {/* Image */}
            <div className="relative">
              <img
                src="/public/members/onyx.png"
                alt="Birthday Gift Image"
                className="rounded-lg object-cover w-full h-88 shadow-md mb-10"
              />
            </div>
              <div>
                  <div className="flex items-center gap-2 mb-2">
                    {/* <span className="text-red-500 text-lg">📝</span> */}
                    <h4 className="font-bold text-black">Additional Notes:</h4>
                  </div>
                  <div className="space-y-1 ml-4">
                    <p className="leading-relaxed">-Birthday gifts are valid only during the birthday month.</p>
                    <p className="leading-relaxed">
                      -Tickets in the gift combo are not valid for special screening formats (IMAX, 4DX, Gold Class,
                      etc.).
                    </p>
                    <p className="leading-relaxed">
                      -Tickets can be used for next-month showtimes if booked while still within birthday month.
                    </p>
                    <p className="leading-relaxed">-Gifts cannot be exchanged for cash or refunded.</p>
                    <p className="leading-relaxed">
                      -Each ID is limited to 03 combos + tickets per day at each cinema.
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {/* <span className="text-blue-500 text-lg">🔍</span> */}
                    <h4 className="font-bold text-black">Check Your Coupons:</h4>
                  </div>
                  <div className="space-y-1 ml-4">
                    <p className="leading-relaxed">
                      <span className="font-semibold">-Website:</span>
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">Log in at onyx.vn</span>  →{" "}
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">ONYX Account</span> →{" "}
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">{"Coupon"}</span>
                    </p>
                    <p className="leading-relaxed">
                      <span className="font-semibold">-App:</span>
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">{"Go to ONYX Member"}</span> →{" "}
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">{"Q.Gift Card | Vouchers | Coupon"}</span>
                    </p>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === "account-management" && (
        <div className="animate-fadeIn">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative">
              <img
                src="/public/members/membership.png"
                alt="Theater seats"
                className="rounded-lg object-cover w-full h-64 shadow-md"
              />
            </div>

            {/* Content */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-black">ACCOUNT MANAGEMENT</h3>

              <p className="text-gray-700">
                Logging into your ONYX Account, you can easily manage your member account such as:
              </p>

              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Check and edit your account information.</li>
                <li>Look up reward points, total spending and transaction history.</li>
                <li>Check the gift cards, vouchers or coupons available in the member's account.</li>
              </ul>

              <p className="text-gray-700">
                Each week, members will receive the ONYX Movie Newsletter via email, updating them with the latest news
                about movies, events and promotions. Update your email, phone and address instantly to always receive
                the latest notifications from ONYX!
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSection === "support" && (
         <div className="animate-fadeIn">

          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative">
              <img
                src="/public/members/supportmembership.png"
                alt="Theater seats"
                className="rounded-lg object-cover w-full    shadow-md"
              />
            </div>

            {/* Content */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-black">SUPPORT</h3>

              <p className="text-gray-700">
                With attractive incentives from the membership program, ONYX hopes to bring you experiences that go far
                beyond cinema.
              </p>

              <p className="text-gray-700">
                If you have any questions about the membership program, you can immediately contact our Customer Support
                Department via email{" "}
                <a href="mailto:hoidap@ONYX.vn" className="text-blue-600 hover:underline">
                  hoidap@ONYX.vn
                </a>{" "}
               (8:00 - 22:00, from Monday to Sunday - including holidays, Tet).
              </p>

              <p className="text-gray-700 font-medium">Thank you for always accompanying ONYX!</p>
            </div>
          </div>
        </div>
      )}

      {activeSection === "membership-levels" && (
        <div className="animate-fadeIn">

          <div className="space-y-4 max-w-6xl mx-auto">
            {/* U22 Members */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className={`w-full flex justify-between items-center p-4 ${
                  expandedLevel === "u22-members" ? "bg-stone-300 text-black" : "bg-stone-300 text-black"
                } font-bold`}
                onClick={() => toggleLevel("u22-members")}
              >
                <span>U22 MEMBERS</span>
                {expandedLevel === "u22-members" ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedLevel === "u22-members" && (
                <div className="p-6 bg-white">
                  <p className="mb-4 text-gray-700">
                    U22 Membership includes all ONYX members aged from 12 to under 23 in the current year. In 2025, U22
                    members are those born in 2003 or later and are entitled to the following benefits:
                  </p>
                  <ul className="space-y-4 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        <strong>Birthday Gift:</strong> One free ONYX Birthday Combo (1 popcorn & 2 drinks) during their
                        birthday month, and one free 2D/3D ticket on their 23rd birthday. The free ticket is valid
                        throughout the birthday month.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        <strong>Reward Points Program:</strong> Earn 5% of the transaction value in reward points at the
                        ticket counter and 3% at the concessions counter. Points can be redeemed for discounts on future
                        purchases.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        <strong>Exclusive Programs:</strong> Opportunities to participate in special events and programs
                        exclusively for ONYX U22 members.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        <strong>Youth Privileges:</strong> All ONYX customers aged 23 and below (including U22 members)
                        are eligible for special ticket and concession prices.
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Regular Members */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className={`w-full flex justify-between items-center p-4 ${
                  expandedLevel === "members" ? "bg-stone-300 text-black" : "bg-stone-300 text-black"
                } font-bold`}
                onClick={() => toggleLevel("members")}
              >
                <span>MEMBERS</span>
                {expandedLevel === "members" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedLevel === "members" && (
                <div className="p-6 bg-white">
                  <p className="mb-4 text-gray-700">
                    Loyal Members are ONYX members aged 23 and above and are entitled to the following benefits:
                  </p>
                  <ul className="space-y-4 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        <strong>Birthday Gift:</strong> One free ONYX Birthday Combo (1 popcorn & 2 drinks) during their
                        birthday month.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        <strong>Reward Points Program:</strong> Earn 5% of the transaction value in reward points at the
                        ticket counter and 3% at the concessions counter. Points can be redeemed for discounts on future
                        purchases.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        <strong>Exclusive Programs:</strong> Opportunities to participate in special events and programs
                        exclusively for ONYX members.
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* VIP Members */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className={`w-full flex justify-between items-center p-4 ${
                  expandedLevel === "vip-members" ? "bg-stone-300 text-black" : "bg-stone-300 text-black"
                } font-bold`}
                onClick={() => toggleLevel("vip-members")}
              >
                <span>VIP MEMBERS</span>
                {expandedLevel === "vip-members" ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedLevel === "vip-members" && (
                <div className="p-6 bg-white">
                  <h3 className="font-bold text-lg mb-2">VIP MEMBER 2025</h3>
                  <p className="mb-4 text-gray-700">
                    A VIP Member 2025 is a ONYX member whose total spending in 2024 ranged from 4,000,000 VND to
                    7,999,999 VND.
                  </p>
                  <p className="mb-4 text-gray-700 italic">
                    (*) Total spending in 2024 includes all successfully completed and paid transactions from January 1,
                    2024, to December 31, 2024.
                  </p>

                  <h4 className="font-bold mb-2">Benefits of VIP 2025:</h4>
                  <ul className="space-y-4 text-gray-700 mb-6">
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <div>
                        <strong>08 Free 2D/3D Movie Tickets</strong>
                        <p className="ml-5">
                          (Valid until December 31, 2025, and can be used to book screenings until January 9, 2026).
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <div>
                        <strong>Special Birthday Gift</strong>
                        <p className="ml-5">
                          (01 ONYX Birthday Combo & 01 free 2D/3D ticket, available during your birthday month).
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <div>
                        <strong>Attractive Reward Points</strong>
                        <p className="ml-5">
                          Earn 7% of the transaction value at the ticket counter and 4% at the concessions counter.
                        </p>
                      </div>
                    </li>
                  </ul>

                  <h4 className="font-bold mb-2">Notes:</h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>The VIP membership level and its benefits are valid until December 31, 2025.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>Benefits can be enjoyed at all ONYX cinemas nationwide.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        Free 2D/3D ticket offers do not apply at special-format cinemas such as 4DX, ULTRA 4DX, IMAX,
                        GOLD CLASS, SWEETBOX, STARIUM, L'AMOUR, PREMIUM, SCREENX, CINE & FORÊT, CINE & LIVING ROOM, and
                        are not applicable for Early Screenings or Special Screenings.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        Free 2D/3D movie ticket offers are not valid on public holidays or Tet, except for
                        birthday-month tickets.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        Membership levels are reviewed annually based on yearly spending. Your total spending will reset
                        to 0 on January 1, 2026.
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* VVIP Members */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className={`w-full flex justify-between items-center p-4 ${
                  expandedLevel === "vvip-members" ? "bg-stone-300 text-black" : "bg-stone-300 text-black"
                } font-bold`}
                onClick={() => toggleLevel("vvip-members")}
              >
                <span>VVIP MEMBERS</span>
                {expandedLevel === "vvip-members" ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedLevel === "vvip-members" && (
                <div className="p-6 bg-white">
                  <h3 className="font-bold text-lg mb-4">VVIP Member 2025</h3>

                  <ul className="space-y-2 text-gray-700 mb-6">
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        <strong>Eligibility:</strong> ONYX members with total spending of 8,000,000 VND or more in 2024.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        <strong>Valid Period:</strong> Until December 31, 2025.
                      </span>
                    </li>
                  </ul>

                  <h4 className="font-bold mb-3">Key Benefits:</h4>
                  <ul className="space-y-3 text-gray-700 mb-6">
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        <strong>10 free 2D/3D tickets</strong> (valid until 31/12/2025; screenings until 09/01/2026).
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        <strong>Birthday gift:</strong> 1 ONYX Birthday Combo + 2 free 2D/3D tickets.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        <strong>Reward points:</strong> 10% at ticket counter, 5% at concessions.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        <strong>Exclusive VVIP gift from ONYX.</strong>
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        <strong>1 Movie Pass:</strong> Free ticket for any format (GOLD CLASS, IMAX, 4DX, etc.), valid
                        even on holidays or early releases.
                      </span>
                    </li>
                  </ul>

                  <h4 className="font-bold mb-3">Bonus Ticket Program:</h4>
                  <ul className="space-y-3 text-gray-700 mb-6">
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        In 2025, after spending 8,000,000 VND, get 1 free 2D/3D ticket for every additional 1,000,000
                        VND spent (no limit).
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>Bonus tickets are added within 24 hours and are valid for 3 months.</span>
                    </li>
                  </ul>

                  <h4 className="font-bold mb-3">Restrictions:</h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-orange-500">•</span>
                      <span>
                        Free 2D/3D tickets (except birthday ones) do not apply at special-format cinemas or on holidays
                        and special screenings.
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </MainLayout>
    
  )
}
