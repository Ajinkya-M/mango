"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

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
  quantity?: number;
  image?: string;
}

const defaultVarieties: MangoVariety[] = [
  {
    id: "alphonso",
    name: "Alphonso (Hapus)",
    origin: "Ratnagiri, India",
    flag: "🇮🇳",
    sweetness: 5,
    price: "£24.99 / box (6 pcs)",
    pricePerBox: 24.99,
    season: "In Season",
    color: "#F59E0B",
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
    color: "#D97706",
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
    color: "#FBBF24",
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
    color: "#EAB308",
    leafColor: "#059669",
    desc: "Juicy, sweet, and low-fiber with dark green-red skin. Large size.",
    quantity: 25,
  },
];

const getStoredVarieties = (): MangoVariety[] => {
  if (typeof window === "undefined") {
    return defaultVarieties;
  }

  const stored = localStorage.getItem("mango_products");
  if (!stored) {
    return defaultVarieties;
  }

  try {
    return JSON.parse(stored) as MangoVariety[];
  } catch {
    return defaultVarieties;
  }
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem("admin_auth") === "true"
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  // Products state
  const [varieties, setVarieties] = useState<MangoVariety[]>(getStoredVarieties);
  
  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariety, setEditingVariety] = useState<MangoVariety | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [flag, setFlag] = useState("🇮🇳");
  const [sweetness, setSweetness] = useState(5);
  const [pricePerBox, setPricePerBox] = useState(20.00);
  const [quantity, setQuantity] = useState(50);
  const [season, setSeason] = useState<"In Season" | "Pre-order" | "Coming Soon">("In Season");
  const [color, setColor] = useState("#F59E0B");
  const [leafColor, setLeafColor] = useState("#10B981");
  const [desc, setDesc] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("mango_products")) {
      localStorage.setItem("mango_products", JSON.stringify(defaultVarieties));
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "mango_products" && event.newValue) {
        try {
          setVarieties(JSON.parse(event.newValue) as MangoVariety[]);
        } catch {
          setVarieties(defaultVarieties);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    setTimeout(() => {
      setLoading(false);
      if (username === "admin" && password === "admin123") {
        sessionStorage.setItem("admin_auth", "true");
        setIsAuthenticated(true);
      } else {
        setLoginError("Invalid admin credentials");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }, 800);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  const openAddModal = () => {
    setEditingVariety(null);
    setName("");
    setOrigin("");
    setFlag("🇮🇳");
    setSweetness(5);
    setPricePerBox(20.00);
    setQuantity(50);
    setSeason("In Season");
    setColor("#F59E0B");
    setLeafColor("#10B981");
    setDesc("");
    setImageDataUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (v: MangoVariety) => {
    setEditingVariety(v);
    setName(v.name);
    setOrigin(v.origin);
    setFlag(v.flag);
    setSweetness(v.sweetness);
    setPricePerBox(v.pricePerBox);
    setQuantity(v.quantity || 0);
    setSeason(v.season);
    setColor(v.color);
    setLeafColor(v.leafColor);
    setDesc(v.desc);
    setImageDataUrl(v.image || "");
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setImageDataUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this variety?")) {
      const updated = varieties.filter((v) => v.id !== id);
      setVarieties(updated);
      localStorage.setItem("mango_products", JSON.stringify(updated));
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !origin.trim() || !desc.trim()) {
      alert("Please fill all required fields");
      return;
    }

    const priceText = `£${pricePerBox.toFixed(2)} / box (6 pcs)`;

    if (editingVariety) {
      // Update
      const updated = varieties.map((v) => {
        if (v.id === editingVariety.id) {
          return {
            ...v,
            name,
            origin,
            flag,
            sweetness,
            price: priceText,
            pricePerBox,
            season,
            color,
            leafColor,
            desc,
            quantity,
            image: imageDataUrl || undefined,
          };
        }
        return v;
      });
      setVarieties(updated);
      localStorage.setItem("mango_products", JSON.stringify(updated));
    } else {
      // Add new
      const newId = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      // Prevent duplicate ID
      if (varieties.some((v) => v.id === newId)) {
        alert("A variety with this name already exists.");
        return;
      }

      const newProduct: MangoVariety = {
        id: newId,
        name,
        origin,
        flag,
        sweetness,
        price: priceText,
        pricePerBox,
        season,
        color,
        leafColor,
        desc,
        quantity,
        image: imageDataUrl || undefined,
      };

      const updated = [...varieties, newProduct];
      setVarieties(updated);
      localStorage.setItem("mango_products", JSON.stringify(updated));
    }

    setIsModalOpen(false);
  };

  // Metrics calculations
  const totalStock = varieties.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const outOfStockCount = varieties.filter((v) => !v.quantity || v.quantity === 0).length;
  const totalValue = varieties.reduce((acc, curr) => acc + (curr.quantity || 0) * curr.pricePerBox, 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 font-sans">
        <div className={`w-full max-w-[390px] bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 transition-transform duration-300 ${shake ? "animate-shake" : ""}`}>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
              <MangoLogo className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 text-center">Mango Admin Portal</h2>
            <p className="text-slate-400 text-xs mt-1 text-center font-medium">Verify credentials to manage products</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-3 text-xs text-slate-900 font-semibold outline-none focus:border-amber-600 focus:bg-white transition-colors"
                placeholder="e.g. admin"
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-3 text-xs text-slate-900 font-semibold outline-none focus:border-amber-600 focus:bg-white transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <div className="text-red-650 text-xs flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-2.5 rounded-xl">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer text-xs mt-6"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Authenticate Admin</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-500 leading-normal">
              💡 **Demo Credentials**: Use Username <span className="text-slate-700 font-semibold">admin</span> and Password <span className="text-slate-700 font-semibold">admin123</span>.
            </div>
            
            <Link
              href="/"
              className="inline-block text-[10px] text-slate-500 hover:text-slate-900 font-semibold hover:underline"
            >
              ← Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <MangoLogo className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-[10px] font-bold text-emerald-600">Secure Mode Verified ✓</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link
              href="/"
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 px-4 py-2 rounded-xl text-[10px] font-bold transition-all"
            >
              View Shop
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 px-4 py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Total Varieties</span>
            <p className="text-xl font-black text-slate-950 mt-1">{varieties.length}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Total Stock</span>
            <p className="text-xl font-black text-slate-950 mt-1">{totalStock} boxes</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Out of Stock</span>
            <p className={`text-xl font-black mt-1 ${outOfStockCount > 0 ? "text-amber-600" : "text-slate-950"}`}>
              {outOfStockCount} items
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Estimated Value</span>
            <p className="text-xl font-black text-slate-950 mt-1">£{totalValue.toFixed(2)}</p>
          </div>
        </div>

        {/* Catalog Table Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white/50 backdrop-blur-xs">
            <div>
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Product Inventory</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Add or update premium mango variety items</p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-2 rounded-xl text-[10px] shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>+ Add Variety</span>
            </button>
          </div>

          <div className="grid gap-4 p-4 sm:hidden">
            {varieties.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                No products in inventory. Click &quot;+ Add Variety&quot; to create one.
              </div>
            ) : (
              varieties.map((v) => (
                <div key={v.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                      <ProductArtwork
                        variety={v}
                        className="w-full h-full rounded-xl object-cover"
                        fallbackClassName="w-8 h-8"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900">{v.name}</h4>
                          <p className="text-[9px] text-slate-400 font-medium mt-0.5">ID: {v.id}</p>
                        </div>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${
                          v.season === "In Season"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                            : v.season === "Pre-order"
                            ? "bg-amber-50 text-amber-800 border border-amber-100"
                            : "bg-slate-100 text-slate-750 border border-slate-200"
                        }`}>
                          {v.season}
                        </span>
                      </div>
                      <p className="mt-2 text-[10px] text-slate-500">{v.flag} {v.origin}</p>
                      <p className="mt-1 text-[10px] text-slate-500 line-clamp-2">{v.desc}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
                    <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                      <span className="block text-[8px] uppercase font-bold tracking-wider text-slate-400">Sweetness</span>
                      <span className="font-extrabold text-amber-600">{v.sweetness}/5</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                      <span className="block text-[8px] uppercase font-bold tracking-wider text-slate-400">Price</span>
                      <span className="font-extrabold text-slate-900">£{v.pricePerBox.toFixed(2)}</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                      <span className="block text-[8px] uppercase font-bold tracking-wider text-slate-400">Stock</span>
                      <span className={`font-extrabold ${!v.quantity || v.quantity === 0 ? "text-red-500" : "text-slate-900"}`}>
                        {v.quantity || 0}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(v)}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl text-[10px] shadow-2xs transition-all cursor-pointer"
                    >
                      Edit Product
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(v.id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 font-bold px-4 py-2.5 rounded-xl text-[10px] transition-all cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Varieties List Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50 text-[9px] font-bold text-slate-450 uppercase tracking-wider">
                  <th className="p-4 pl-6">Profile</th>
                  <th className="p-4">Origin</th>
                  <th className="p-4">Sweetness</th>
                  <th className="p-4">Season</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[10px] font-semibold text-slate-700">
                {varieties.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                      No products in inventory. Click &quot;+ Add Variety&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  varieties.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          <ProductArtwork
                            variety={v}
                            className="w-full h-full rounded-lg object-cover"
                            fallbackClassName="w-6 h-6"
                          />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block">{v.name}</span>
                          <span className="text-[8px] text-slate-400 mt-0.5 block font-medium">ID: {v.id}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1">
                          <span>{v.flag}</span>
                          <span>{v.origin}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-amber-500 font-extrabold">{v.sweetness}</span>
                        <span className="text-slate-400 font-medium"> / 5</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold ${
                          v.season === "In Season"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                            : v.season === "Pre-order"
                            ? "bg-amber-50 text-amber-800 border border-amber-100"
                            : "bg-slate-100 text-slate-750 border border-slate-200"
                        }`}>
                          {v.season}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">£{v.pricePerBox.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`font-bold ${!v.quantity || v.quantity === 0 ? "text-red-500" : "text-slate-900"}`}>
                          {v.quantity || 0} boxes
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(v)}
                          className="text-amber-600 hover:text-amber-700 font-bold hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add / Edit Product Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                {editingVariety ? "Edit Mango Variety" : "Create New Variety"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500 transition-colors focus:outline-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-thin">
              <div>
                <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Product Photo</label>
                <div className="rounded-2xl border border-dashed border-slate-250 bg-slate-50 p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {imageDataUrl ? (
                        <img
                          src={imageDataUrl}
                          alt={`${name || "Product"} preview`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <MangoLogo className="w-10 h-10" varietyColor={color} varietyLeafColor={leafColor} />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-[10px] font-semibold text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-amber-600 file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-white hover:file:bg-amber-700"
                      />
                      <p className="text-[9px] text-slate-400">
                        Upload a product photo to replace the default mango illustration.
                      </p>
                      {imageDataUrl && (
                        <button
                          type="button"
                          onClick={() => setImageDataUrl("")}
                          className="text-[10px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                        >
                          Remove uploaded photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Variety Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-amber-600 focus:bg-white"
                    placeholder="e.g. Sindhri"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Origin *</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-amber-600 focus:bg-white"
                    placeholder="e.g. Sindh, Pakistan"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Country Flag *</label>
                  <select
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-amber-600 focus:bg-white"
                  >
                    <option value="🇮🇳">🇮🇳 India</option>
                    <option value="🇵🇰">🇵🇰 Pakistan</option>
                    <option value="🇲🇽">🇲🇽 Mexico</option>
                    <option value="🇵🇪">🇵🇪 Peru</option>
                    <option value="🇹🇭">🇹🇭 Thailand</option>
                    <option value="🇦🇪">🇦🇪 UAE</option>
                    <option value="🇬🇧">🇬🇧 UK</option>
                    <option value="🇺🇸">🇺🇸 US</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Sweetness (1-5) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={sweetness}
                    onChange={(e) => setSweetness(parseFloat(e.target.value) || 5)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-amber-600 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Season Status *</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value as MangoVariety["season"])}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-amber-600 focus:bg-white"
                  >
                    <option value="In Season">In Season</option>
                    <option value="Pre-order">Pre-order</option>
                    <option value="Coming Soon">Coming Soon</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Price per Box (£) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricePerBox}
                    onChange={(e) => setPricePerBox(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-amber-600 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Stock Quantity (boxes) *</label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-amber-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Fruit SVG Color *</label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-amber-600 focus:bg-white"
                  >
                    <option value="#F59E0B">Golden Orange (#F59E0B)</option>
                    <option value="#D97706">Deep Amber (#D97706)</option>
                    <option value="#FBBF24">Honey Yellow (#FBBF24)</option>
                    <option value="#EAB308">Lemon Yellow (#EAB308)</option>
                    <option value="#EF4444">Ruby Mango Red (#EF4444)</option>
                    <option value="#10B981">Green Mango (#10B981)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Leaf SVG Color *</label>
                  <select
                    value={leafColor}
                    onChange={(e) => setLeafColor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-amber-600 focus:bg-white"
                  >
                    <option value="#10B981">Bright Emerald (#10B981)</option>
                    <option value="#059669">Deep Green (#059669)</option>
                    <option value="#15803D">Forest Green (#15803D)</option>
                    <option value="#84CC16">Lime Green (#84CC16)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Product Description *</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-amber-600 focus:bg-white"
                  placeholder="Describe taste, profile, characteristics, etc."
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 px-4 py-2 rounded-xl text-[10px] font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-[10px] shadow-2xs transition-all cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline brand logo to keep admin route modular
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
      <path
        d="M12.5 7.5C12.5 7.5 13.5 4.5 16 3.5C18.5 2.5 18 5 18 5C18 5 17 8 14.5 9C12 10 12.5 7.5 12.5 7.5Z"
        fill={finalLeafColor}
      />
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
