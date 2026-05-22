"use client";

import React, { useState, useEffect, useRef } from "react";

// Country list configuration
interface Country {
  name: string;
  code: string;
  flag: string;
  format: string;
  placeholder: string;
}

const countries: Country[] = [
  { name: "United Kingdom", code: "+44", flag: "🇬🇧", format: "XXXX XXXXXX", placeholder: "7700 900077" },
  { name: "India", code: "+91", flag: "🇮🇳", format: "XXXXX-XXXXX", placeholder: "98765 43210" },
  { name: "United States", code: "+1", flag: "🇺🇸", format: "XXX-XXX-XXXX", placeholder: "555-0199" },
  { name: "United Arab Emirates", code: "+971", flag: "🇦🇪", format: "XX XXX XXXX", placeholder: "50 123 4567" },
  { name: "Canada", code: "+1", flag: "🇨🇦", format: "XXX-XXX-XXXX", placeholder: "555-0199" },
  { name: "Australia", code: "+61", flag: "🇦🇺", format: "XXX XXX XXX", placeholder: "412 345 678" },
  { name: "Singapore", code: "+65", flag: "🇸🇬", format: "XXXX XXXX", placeholder: "8123 4567" },
  { name: "Germany", code: "+49", flag: "🇩🇪", format: "XXXX XXXXXXX", placeholder: "170 1234567" },
];

// Mango variety interface
interface MangoVariety {
  id: string;
  name: string;
  origin: string;
  flag: string;
  sweetness: number;
  price: string;
  pricePerBox: number;
  season: "In Season" | "Pre-order" | "Coming Soon";
  color: string;
  leafColor: string;
  desc: string;
  quantity?: number; // Stock quantity
  image?: string;
}

const mangoVarieties: MangoVariety[] = [
  {
    id: "alphonso",
    name: "Alphonso (Hapus)",
    origin: "Ratnagiri, India",
    flag: "🇮🇳",
    sweetness: 5,
    price: "£24.99 / box (6 pcs)",
    pricePerBox: 24.99,
    season: "In Season",
    color: "#F59E0B", // Golden Orange
    leafColor: "#10B981",
    desc: "King of mangoes. Extremely rich, sweet, and creamy with low fiber.",
    quantity: 50,
  },
  {
    id: "kesar",
    name: "Kesar (Saffron)",
    origin: "Gujarat, India",
    flag: "🇮🇳",
    sweetness: 4.8,
    price: "£22.00 / box (6 pcs)",
    pricePerBox: 22.00,
    season: "In Season",
    color: "#D97706", // Deep Amber
    leafColor: "#059669",
    desc: "Intensely aromatic with a distinct saffron tint and luscious sweet flesh.",
    quantity: 35,
  },
  {
    id: "ataulfo",
    name: "Ataulfo (Honey)",
    origin: "Soconusco, Mexico",
    flag: "🇲🇽",
    sweetness: 4.5,
    price: "£18.50 / box (6 pcs)",
    pricePerBox: 18.50,
    season: "In Season",
    color: "#FBBF24", // Warm Honey Yellow
    leafColor: "#10B981",
    desc: "Delicate and sweet with a buttery texture and very thin seed.",
    quantity: 80,
  },
  {
    id: "kent",
    name: "Kent Organic",
    origin: "Piura, Peru",
    flag: "🇵🇪",
    sweetness: 4.0,
    price: "£15.00 / box (4 pcs)",
    pricePerBox: 15.00,
    season: "Pre-order",
    color: "#EAB308", // Variegated tint
    leafColor: "#059669",
    desc: "Juicy, sweet, and low-fiber with dark green-red skin. Large size.",
    quantity: 25,
  },
];

type AppStep = "phone" | "otp" | "success" | "dashboard" | "browse" | "inventory" | "cart";

const getStoredVarieties = (): MangoVariety[] => {
  if (typeof window === "undefined") {
    return mangoVarieties;
  }

  const stored = localStorage.getItem("mango_products");
  if (!stored) {
    return mangoVarieties;
  }

  try {
    return JSON.parse(stored) as MangoVariety[];
  } catch {
    return mangoVarieties;
  }
};

export default function Home() {
  const [step, setStep] = useState<AppStep>("phone");
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [timer, setTimer] = useState(59);
  const [shake, setShake] = useState(false);
  const [successProgress, setSuccessProgress] = useState(0);
  const [orderPromptMsg, setOrderPromptMsg] = useState("");

  // E-commerce state properties
  interface CartItem {
    variety: MangoVariety;
    quantity: number;
  }
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState("10 Downing Street, London, SW1A 2AA");
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);
  const [varieties, setVarieties] = useState<MangoVariety[]>(getStoredVarieties);

  // Sync products list from localStorage
  useEffect(() => {
    if (!localStorage.getItem("mango_products")) {
      localStorage.setItem("mango_products", JSON.stringify(mangoVarieties));
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mango_products" && e.newValue) {
        try {
          setVarieties(JSON.parse(e.newValue) as MangoVariety[]);
        } catch {
          setVarieties(mangoVarieties);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // References for OTP fields auto-focus
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown logic for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Dynamic success redirection progress
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    if (step === "success") {
      progressInterval = setInterval(() => {
        setSuccessProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
              // LANDING LOGIC: Land on Cart if items in cart, otherwise land on Inventory
              if (cart.length > 0) {
                setStep("cart");
              } else {
                setStep("inventory");
              }
            }, 200);
            return 100;
          }
          return prev + 4;
        });
      }, 50);
    }
    return () => clearInterval(progressInterval);
  }, [step, cart]);

  // Sanitize and handle phone input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, ""); // Keep digits only
    setPhoneNumber(rawVal);
    if (errorMessage) setErrorMessage("");
    if (orderPromptMsg) setOrderPromptMsg("");
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 7) {
      setErrorMessage("Please enter a valid mobile number");
      return;
    }
    setLoading(true);
    setErrorMessage("");

    // Simulate OTP network request delay
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setTimer(59);
      setOtp(Array(6).fill(""));
      // Focus the first OTP box
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }, 1200);
  };

  // OTP box key-by-key navigation and entry
  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, "").slice(-1); // Only allow single digit
    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);
    setErrorMessage("");

    // If filled, move focus to next input
    if (cleanValue && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current value is empty, go to previous input and delete
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpRefs.current[index - 1]?.focus();
      } else {
        // Delete current value
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasteData.length === 6) {
      const newOtp = pasteData.split("");
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setErrorMessage("Please enter all 6 digits");
      triggerShake();
      return;
    }

    setLoading(true);
    setErrorMessage("");

    // Mock OTP verification (Correct code: 123456)
    setTimeout(() => {
      setLoading(false);
      if (otpCode === "123456") {
        setSuccessProgress(0);
        setStep("success");
      } else {
        setErrorMessage("Invalid verification code. Use '123456' to test.");
        triggerShake();
      }
    }, 1200);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleResendOtp = () => {
    if (timer > 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setTimer(59);
      setOtp(Array(6).fill(""));
      setErrorMessage("");
      otpRefs.current[0]?.focus();
    }, 1000);
  };

  const handleLogout = () => {
    setStep("phone");
    setPhoneNumber("");
    setOtp(Array(6).fill(""));
    setErrorMessage("");
    setOrderPromptMsg("");
    setCart([]);
    setOrderPlacedSuccess(false);
  };

  // Pre-select mango from public view and redirect
  const handleSelectMangoAndLogin = (variety: MangoVariety) => {
    // Resolve current variety stock
    const currentVar = varieties.find((v) => v.id === variety.id) || variety;
    if (currentVar.quantity === 0) {
      alert(`${variety.name} is currently out of stock!`);
      return;
    }
    setCart([{ variety, quantity: 1 }]);
    setOrderPromptMsg(`Please login to order ${variety.name}`);
    setStep("phone");
  };

  // Select mango directly from inventory when logged-in
  const handleSelectMangoLoggedIn = (variety: MangoVariety) => {
    const currentVar = varieties.find((v) => v.id === variety.id) || variety;
    if (currentVar.quantity === 0) {
      alert(`${variety.name} is currently out of stock!`);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.variety.id === variety.id);
      if (existingItem) {
        const maxStock = currentVar.quantity !== undefined ? currentVar.quantity : 999;
        const newQty = Math.min(maxStock, existingItem.quantity + 1);
        if (newQty === existingItem.quantity && currentVar.quantity !== undefined) {
          alert(`You've reached the maximum available stock (${currentVar.quantity} boxes) for ${variety.name}.`);
        }
        return prevCart.map((item) =>
          item.variety.id === variety.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prevCart, { variety, quantity: 1 }];
    });
    setStep("cart");
  };

  // Remove product from cart by variety ID
  const handleRemoveItem = (varietyId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.variety.id !== varietyId));
  };

  // Confirm and place mock order and deduct stock
  const handlePlaceOrder = () => {
    if (!deliveryAddress.trim() || cart.length === 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      // Deduct stock quantities in varieties state
      setVarieties((prevVarieties) => {
        const updated = prevVarieties.map((v) => {
          const cartItem = cart.find((item) => item.variety.id === v.id);
          if (cartItem) {
            const currentQty = v.quantity !== undefined ? v.quantity : 50;
            return {
              ...v,
              quantity: Math.max(0, currentQty - cartItem.quantity),
            };
          }
          return v;
        });
        localStorage.setItem("mango_products", JSON.stringify(updated));
        return updated;
      });

      setOrderPlacedSuccess(true);
    }, 1500);
  };

  const handleOrderSuccessClose = () => {
    setCart([]);
    setOrderPlacedSuccess(false);
    setStep("inventory");
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 min-h-screen bg-slate-100">
      {/* Main Container: Slate mobile viewport card with shadow */}
      <div className="w-full max-w-[390px] min-h-[660px] flex flex-col justify-between rounded-2xl bg-white shadow-lg overflow-hidden relative border border-slate-200 transition-all duration-300">
        
        {/* Simple top system indicator mock */}
        <div className="hidden sm:flex justify-between items-center px-6 pt-4 pb-2 text-[10px] text-slate-400 font-bold tracking-wider select-none">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            {/* Battery, Wifi & Signal SVG mock in light gray */}
            <svg className="w-3 h-3 fill-slate-400" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.79-1.79C9.09 19.64 10.51 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
            <svg className="w-3 h-3 fill-slate-400" viewBox="0 0 24 24"><path d="M17.5 12c.83 0 1.5-.67 1.5-1.5S18.33 9 17.5 9 16 9.67 16 10.5s.67 1.5 1.5 1.5zm-5 0c.83 0 1.5-.67 1.5-1.5S13.33 9 12.5 9s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 0C8.33 12 9 11.33 9 10.5S8.33 9 7.5 9 6 9.67 6 10.5 6.67 12 7.5 12z"/></svg>
            <div className="w-4.5 h-2.5 border border-slate-300 rounded-2xs p-0.5 flex items-center"><div className="h-full w-full bg-slate-400 rounded-3xs" /></div>
          </div>
        </div>

        {/* STEP 1: Phone number entrance */}
        {step === "phone" && (
          <div className="flex-1 flex flex-col justify-between p-6 sm:p-7 animate-fade-in">
            {/* Header / Brand */}
            <div className="mt-2 text-center flex flex-col items-center justify-center flex-1 min-h-[260px]">
              <MangoLogo className="w-72 h-72 text-amber-600 mb-2" />
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Mango
              </h1>
              <p className="text-slate-550 text-xs mt-1 font-semibold">
                Verify your mobile number to get started
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendOtp} className="mt-8 flex-1 flex flex-col justify-center">
              <div className="space-y-4">
                
                {orderPromptMsg && (
                  <div className="text-amber-800 text-xs flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-3 py-2.5 rounded-xl animate-fade-in">
                    <span className="font-semibold">{orderPromptMsg}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    Mobile Number
                  </label>
                  
                  <div className="flex gap-2 relative">
                    {/* Country Selector Trigger */}
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="bg-white px-3.5 py-3 rounded-xl flex items-center gap-1 border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400"
                    >
                      <span>{selectedCountry.flag}</span>
                      <span className="font-semibold text-slate-700">{selectedCountry.code}</span>
                      <svg
                        className="w-3 h-3 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Phone Input Box */}
                    <div className="flex-1 relative bg-white rounded-xl border border-slate-200 transition-colors duration-150 focus-within:border-amber-600">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder={selectedCountry.placeholder}
                        className="w-full bg-transparent px-4 py-3 text-sm text-slate-900 outline-none placeholder-slate-300 font-medium"
                        maxLength={15}
                        required
                        autoFocus
                      />
                    </div>

                    {/* Country Dropdown Panel */}
                    {showCountryDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setShowCountryDropdown(false)}
                        />
                        <div className="absolute left-0 bottom-full mb-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 max-h-52 overflow-y-auto animate-scale-in">
                          <div className="text-[9px] uppercase font-bold text-slate-400 px-2.5 py-1.5 tracking-wider border-b border-slate-100 mb-1">
                            Select Country
                          </div>
                          {countries.map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setShowCountryDropdown(false);
                                setPhoneNumber("");
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left hover:bg-slate-50 transition-colors text-xs ${
                                selectedCountry.name === c.name ? "bg-slate-50 text-amber-600 font-semibold" : "text-slate-600"
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span>{c.flag}</span>
                                <span>{c.name}</span>
                              </div>
                              <span className="font-semibold opacity-75">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {errorMessage && (
                  <div className="text-red-655 text-xs flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-2.5 rounded-xl animate-shake">
                    <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={loading || !phoneNumber}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 rounded-xl mt-8 shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer text-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>

              {/* Browse products link */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setStep("browse")}
                  className="text-xs text-amber-600 hover:text-amber-700 font-bold hover:underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto py-1 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/60 transition-colors"
                >
                  <span>Explore Mango Varieties (No Login)</span>
                  <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Terms notice */}
            <div className="mt-6 text-center">
              <p className="text-[10px] text-slate-400 leading-normal">
                By entering, you agree to our <span className="underline hover:text-slate-500 cursor-pointer">Terms of Service</span> & <span className="underline hover:text-slate-500 cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: OTP inputs */}
        {step === "otp" && (
          <div className="flex-1 flex flex-col justify-between p-6 sm:p-7 animate-fade-in">
            <div>
              {/* Back navigation */}
              <button
                onClick={() => setStep("phone")}
                className="mt-2 w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-650 transition-colors focus:outline-none"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="mt-5">
                <h2 className="text-xl font-bold text-slate-900">Verification code</h2>
                <p className="text-slate-500 text-xs mt-1">
                  Enter the 6-digit verification code sent to{" "}
                  <span className="text-slate-800 font-semibold">
                    {selectedCountry.code} {phoneNumber}
                  </span>
                </p>
              </div>

              {/* Six Digit Inputs grid */}
              <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
                <div className={`flex justify-between gap-1.5 ${shake ? "animate-shake" : ""}`}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-10 h-12 bg-white border border-slate-200 rounded-lg text-center text-lg font-bold text-slate-900 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 transition-colors"
                      required
                    />
                  ))}
                </div>

                {errorMessage && (
                  <div className="text-red-655 text-xs flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-2.5 rounded-xl">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.some(v => !v)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify Code</span>
                  )}
                </button>
              </form>
            </div>

            {/* OTP countdown Resend */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-xs text-slate-500">
                {timer > 0 ? (
                  <span>
                    Resend code in <span className="text-slate-850 font-semibold">{timer}s</span>
                  </span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-amber-600 font-bold hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                )}
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-500 leading-normal">
                💡 **Demo Mode**: Enter <span className="text-slate-700 font-semibold">123456</span> to complete verification.
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Success Screen (Minimal checkmark transition) */}
        {step === "success" && (
          <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-7 animate-scale-in">
            <div className="w-16 h-16 flex items-center justify-center bg-amber-50 border border-amber-200 rounded-full mb-5">
              <svg className="w-6 h-6 text-amber-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-center text-slate-900">Verification complete</h2>
            <p className="text-slate-500 text-xs mt-1.5 text-center">
              Successfully authenticated.
            </p>

            {/* Progress line */}
            <div className="w-36 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-6 border border-slate-200">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-75"
                style={{ width: `${successProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 4: Browse Mango Catalog (No Login View) */}
        {step === "browse" && (
          <div className="flex-1 flex flex-col justify-between animate-fade-in bg-slate-50">
            {/* Header with back button */}
            <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white/90 backdrop-blur-md sticky top-0 z-10">
              <button
                onClick={() => setStep("phone")}
                className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-650 transition-colors focus:outline-none"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Mango Varieties</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Available for delivery</p>
              </div>
            </div>

            {/* Varieties Scroll List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
              {varieties.map((m) => (
                <div
                  key={m.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow duration-200 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
                    <MangoLogo className="w-24 h-24" />
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <ProductArtwork
                          variety={m}
                          className="w-full h-full rounded-xl object-cover"
                          fallbackClassName="w-10 h-10"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-slate-900">{m.name}</h4>
                          <span className="text-[10px]" title={m.origin}>{m.flag}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{m.origin}</p>
                      </div>
                    </div>

                    <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full ${
                      m.quantity === 0
                        ? "bg-red-50 text-red-800 border border-red-100"
                        : m.season === "In Season"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                        : "bg-amber-50 text-amber-800 border border-amber-100"
                    }`}>
                      {m.quantity === 0 ? "Out of Stock" : m.season}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed mt-2.5">
                    {m.desc}
                  </p>

                  {/* Stock level indicator */}
                  <div className="mt-2 text-[9px] font-semibold text-slate-400">
                    {m.quantity === 0 ? (
                      <span className="text-red-650">Out of Stock</span>
                    ) : m.quantity !== undefined ? (
                      <span>Stock: <strong className="text-slate-600">{m.quantity}</strong> boxes available</span>
                    ) : (
                      <span className="text-emerald-650">In Stock</span>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400">Price</span>
                      <p className="text-xs font-extrabold text-slate-900">{m.price}</p>
                    </div>

                    <button
                      onClick={() => handleSelectMangoAndLogin(m)}
                      disabled={m.quantity === 0}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer ${
                        m.quantity === 0
                          ? "bg-slate-100 text-slate-400 border border-slate-200 pointer-events-none cursor-not-allowed"
                          : "bg-amber-600 hover:bg-amber-700 text-white hover:shadow-xs active:scale-95"
                      }`}
                    >
                      {m.quantity === 0 ? "Sold Out" : "Order Now"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Prompt */}
            <div className="p-3 bg-white border-t border-slate-200 text-center">
              <button
                onClick={() => setStep("phone")}
                className="text-[10px] text-slate-500 hover:text-slate-800 font-semibold"
              >
                Have an account? <span className="text-amber-600 hover:underline">Sign In</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Inventory / Product Selection Page (Logged In) */}
        {step === "inventory" && (
          <div className="flex-1 flex flex-col justify-between animate-fade-in bg-slate-50">
            {/* Header section */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <MangoLogo className="w-7 h-7 text-amber-600" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Select Mango</h3>
                  <p className="text-[10px] text-emerald-650 font-bold">Logged In ✓</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>

            {/* Product selection grid */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10px] text-amber-900 leading-normal mb-2">
                👋 Select a variety to add to your order cart.
              </div>

              {varieties.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleSelectMangoLoggedIn(m)}
                  className={`bg-white border rounded-2xl p-4 shadow-2xs transition-all duration-200 flex flex-col justify-between relative overflow-hidden group ${
                    m.quantity === 0
                      ? "opacity-60 border-slate-200 cursor-not-allowed"
                      : "border-slate-200 hover:border-amber-500 hover:shadow-xs cursor-pointer"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <ProductArtwork
                          variety={m}
                          className="w-full h-full rounded-xl object-cover"
                          fallbackClassName="w-10 h-10"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-600 transition-colors">{m.name}</h4>
                          <span className="text-[10px]">{m.flag}</span>
                        </div>
                        <p className="text-[9px] text-slate-450 font-semibold mt-0.5">{m.origin}</p>
                      </div>
                    </div>

                    <span className="text-[8px] font-bold text-slate-400">Sweetness: {m.sweetness}/5</span>
                  </div>

                  <p className="text-[10px] text-slate-555 leading-relaxed mt-2.5">
                    {m.desc}
                  </p>

                  {/* Stock level indicator */}
                  <div className="mt-2 text-[9px] font-semibold text-slate-400">
                    {m.quantity === 0 ? (
                      <span className="text-red-550">Out of Stock</span>
                    ) : m.quantity !== undefined ? (
                      <span>Stock: <strong className="text-slate-600">{m.quantity}</strong> boxes available</span>
                    ) : (
                      <span className="text-emerald-650">In Stock</span>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-900">{m.price}</span>
                    {m.quantity === 0 ? (
                      <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1">
                        <span>Sold Out</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-extrabold group-hover:underline flex items-center gap-1">
                        <span>Add to Order</span>
                        <span>➔</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Logged in Navigation Tab Bar */}
            <div className="p-2 border-t border-slate-200 bg-white/90 backdrop-blur-md flex justify-around items-center">
              <button
                onClick={() => setStep("inventory")}
                className="flex flex-col items-center justify-center p-1.5 text-amber-600"
              >
                <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="text-[7px] font-bold tracking-wider uppercase mt-1">Inventory</span>
              </button>
              <button
                onClick={() => setStep("cart")}
                className="flex flex-col items-center justify-center p-1.5 text-slate-400 hover:text-slate-650 relative"
              >
                {cart.length > 0 && (
                  <span className="absolute top-1 right-2 w-2 h-2 bg-amber-600 rounded-full" />
                )}
                <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-[7px] font-bold tracking-wider uppercase mt-1">Cart</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Cart & Checkout Page (Logged In) */}
        {step === "cart" && (
          <div className="flex-1 flex flex-col justify-between animate-fade-in bg-slate-50">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep("inventory")}
                  className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-650 transition-colors focus:outline-none"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="font-extrabold text-sm text-slate-900">Your Cart</h3>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>

            {/* Cart content details */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
              {orderPlacedSuccess ? (
                /* Success Checkout Popup Screen */
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm space-y-4 my-8 animate-scale-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-lg">
                    ✓
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">Order Confirmed!</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Your shipment of {cart.length} {cart.length === 1 ? 'variety' : 'varieties'} is registered. Fresh deliveries are headed to:
                  </p>
                  <p className="text-[10px] bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 font-semibold text-slate-700 text-center leading-normal">
                    {deliveryAddress}
                  </p>
                  <button
                    onClick={handleOrderSuccessClose}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-xl text-[10px] transition-colors"
                  >
                    Back to Catalog
                  </button>
                </div>
              ) : cart.length > 0 ? (
                /* Cart Item Review */
                <div className="space-y-4">

                  {/* Cart Items List */}
                  {cart.map((item) => {
                    // Resolve the latest variety details dynamically from varieties list
                    const latestVariety = varieties.find((v) => v.id === item.variety.id) || item.variety;
                    return (
                      <div key={item.variety.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex justify-between">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <ProductArtwork
                              variety={latestVariety}
                              className="w-full h-full rounded-xl object-cover"
                              fallbackClassName="w-10 h-10"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">{latestVariety.name}</h4>
                            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{latestVariety.origin} {latestVariety.flag}</p>
                            <p className="text-xs font-bold text-slate-750 mt-1">£{latestVariety.pricePerBox.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Quantity selectors */}
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1 bg-slate-50">
                            <button
                              onClick={() => setCart((prevCart) =>
                                prevCart.map((i) =>
                                  i.variety.id === item.variety.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
                                )
                              )}
                              className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95"
                            >
                              -
                            </button>
                            <span className="text-xs font-extrabold text-slate-800 min-w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => setCart((prevCart) =>
                                prevCart.map((i) => {
                                  if (i.variety.id === item.variety.id) {
                                    const maxStock = latestVariety.quantity !== undefined ? latestVariety.quantity : 999;
                                    const newQty = Math.min(maxStock, i.quantity + 1);
                                    if (newQty === i.quantity && latestVariety.quantity !== undefined) {
                                      alert(`Only ${latestVariety.quantity} boxes are available in stock.`);
                                    }
                                    return { ...i, quantity: newQty };
                                  }
                                  return i;
                                })
                              )}
                              className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95"
                            >
                              +
                            </button>
                          </div>
                          {/* Remove product button */}
                          <button
                            onClick={() => handleRemoveItem(item.variety.id)}
                            className="mt-2 text-[9px] text-red-650 font-bold hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Change variety link */}
                  <div className="flex justify-between items-center px-1">
                    <button
                      onClick={() => setStep("inventory")}
                      className="text-[10px] text-amber-600 hover:text-amber-700 font-bold hover:underline cursor-pointer"
                    >
                      ← Back to Inventory (add more varieties)
                    </button>
                    <span className="text-[9px] text-slate-400 font-semibold">{cart.length} {cart.length === 1 ? 'item' : 'items'} selected</span>
                  </div>

                  {/* Delivery Location inputs */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                    <h5 className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Delivery Address</h5>

                    <div className="space-y-1">
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold outline-none focus:border-amber-600 focus:bg-white"
                        placeholder="Enter full address"
                        required
                      />
                    </div>
                    <p className="text-[8px] text-slate-400 font-semibold">
                      Contact Phone: <span className="text-slate-700">{phoneNumber ? `${selectedCountry.code} ${phoneNumber}` : "Verified Account"}</span>
                    </p>
                  </div>

                  {/* Pricing Breakdown Summary */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
                    {cart.map((item) => {
                      const latestVariety = varieties.find((v) => v.id === item.variety.id) || item.variety;
                      return (
                        <div key={item.variety.id} className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                          <span>{latestVariety.name} x{item.quantity}</span>
                          <span>£{(latestVariety.pricePerBox * item.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                      <span>Shipping Fee</span>
                      <span className="text-emerald-650">FREE</span>
                    </div>
                    <div className="h-px bg-slate-100 my-1" />
                    <div className="flex justify-between items-center text-xs font-extrabold text-slate-900">
                      <span>Total Amount</span>
                      <span>
                        £
                        {cart.reduce((sum, item) => {
                          const latestVariety = varieties.find((v) => v.id === item.variety.id) || item.variety;
                          return sum + latestVariety.pricePerBox * item.quantity;
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Order Confirm Trigger */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading || !deliveryAddress.trim()}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 rounded-xl mt-6 shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <span>Place Order</span>
                    )}
                  </button>

                </div>
              ) : (
                /* Empty state */
                <div className="text-center py-12 px-6">
                  <div className="text-3xl text-slate-300">🛒</div>
                  <h4 className="font-extrabold text-sm text-slate-900 mt-3">Your cart is empty</h4>
                  <p className="text-[10px] text-slate-450 leading-normal mt-1.5">
                    Browse our premium inventory and select a variety to order.
                  </p>
                  <button
                    onClick={() => setStep("inventory")}
                    className="mt-6 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-4 py-2 rounded-xl shadow-xs"
                  >
                    Go to Inventory
                  </button>
                </div>
              )}
            </div>

            {/* Logged in Navigation Tab Bar */}
            <div className="p-2 border-t border-slate-200 bg-white/90 backdrop-blur-md flex justify-around items-center">
              <button
                onClick={() => setStep("inventory")}
                className="flex flex-col items-center justify-center p-1.5 text-slate-400 hover:text-slate-650"
              >
                <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="text-[7px] font-bold tracking-wider uppercase mt-1">Inventory</span>
              </button>
              <button
                onClick={() => setStep("cart")}
                className="flex flex-col items-center justify-center p-1.5 text-amber-600 relative"
              >
                {cart.length > 0 && !orderPlacedSuccess && (
                  <span className="absolute top-1 right-2 w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
                )}
                <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-[7px] font-bold tracking-wider uppercase mt-1">Cart</span>
              </button>
            </div>
          </div>
        )}

        {/* Subtle bottom indicator mock */}
        <div className="pb-2 pt-1 flex justify-center bg-transparent">
          <div className="w-20 h-1 bg-slate-200 rounded-full" />
        </div>

      </div>
    </div>
  );
}

// Brand SVG Mango logo component (Amber colored outline)
function MangoLogo({
  className = "",
  varietyColor,
  varietyLeafColor,
}: {
  className?: string;
  varietyColor?: string;
  varietyLeafColor?: string;
}) {
  const finalFruitColor = varietyColor || "currentColor";
  const finalLeafColor = varietyLeafColor || "#10b981";

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Mango Leaf */}
      <path
        d="M12.5 7.5C12.5 7.5 13.5 4.5 16 3.5C18.5 2.5 18 5 18 5C18 5 17 8 14.5 9C12 10 12.5 7.5 12.5 7.5Z"
        fill={finalLeafColor}
      />
      {/* Mango fruit outline and base path */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.1824 10.3787C8.58332 8.3512 11.2338 7.39994 13.1256 8.74696C15.0173 10.094 16.5912 12.0124 16.9407 14.5422C17.3826 17.7408 15.074 20.7303 12.0465 21.3659C9.01901 22.0016 6.34752 20.0384 5.3474 17.5857C4.34728 15.1331 5.78148 12.4062 7.1824 10.3787Z"
        fill={finalFruitColor}
      />
    </svg>
  );
}

function ProductArtwork({
  variety,
  className = "",
  fallbackClassName = "",
}: {
  variety: MangoVariety;
  className?: string;
  fallbackClassName?: string;
}) {
  if (variety.image) {
    return <img src={variety.image} alt={variety.name} className={className} />;
  }

  return (
    <MangoLogo
      className={fallbackClassName}
      varietyColor={variety.color}
      varietyLeafColor={variety.leafColor}
    />
  );
}
