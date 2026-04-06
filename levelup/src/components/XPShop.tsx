"use client";

import { useState } from "react";
import {
  type Profile,
  type ShopPurchase,
  saveProfile,
  loadShopPurchases,
  saveShopPurchases,
  loadStreakFreezes,
  saveStreakFreezes,
} from "@/lib/storage";
import { SHOP_ITEMS } from "@/lib/game-data";

interface Props {
  profile: Profile;
  onProfileUpdate: (p: Profile) => void;
  onToast?: (message: string) => void;
}

export default function XPShop({ profile, onProfileUpdate, onToast }: Props) {
  const [purchases, setPurchases] = useState<ShopPurchase[]>(loadShopPurchases());
  const [filter, setFilter] = useState<"all" | "title" | "cosmetic" | "perk">("all");

  const isPurchased = (id: string) => purchases.some((p) => p.id === id);

  const buyItem = (item: (typeof SHOP_ITEMS)[number]) => {
    if (profile.xp < item.cost || isPurchased(item.id)) return;

    const newProfile = { ...profile, xp: profile.xp - item.cost };
    saveProfile(newProfile);
    onProfileUpdate(newProfile);

    const newPurchases = [...purchases, { id: item.id, purchasedAt: new Date().toISOString() }];
    saveShopPurchases(newPurchases);
    setPurchases(newPurchases);

    // Handle perk-specific logic
    if (item.id === "perk-freeze-3pack") {
      const freezes = loadStreakFreezes();
      freezes.available += 3;
      saveStreakFreezes(freezes);
    }

    onToast?.(`Purchased ${item.name}!`);
  };

  const filtered = SHOP_ITEMS.filter((i) => filter === "all" || i.category === filter);
  const categories = [
    { id: "all" as const, label: "All", icon: "🏪" },
    { id: "title" as const, label: "Titles", icon: "📛" },
    { id: "cosmetic" as const, label: "Cosmetics", icon: "✨" },
    { id: "perk" as const, label: "Perks", icon: "⚡" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
          XP Shop
        </h1>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-dim)] border border-[var(--accent)]" style={{ borderColor: "rgba(232,168,73,0.3)" }}>
          <span className="text-sm">💰</span>
          <span className="text-sm font-bold text-[var(--accent)]">{profile.xp.toLocaleString()} XP</span>
        </div>
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Spend your hard-earned XP on titles, cosmetics, and perks.
      </p>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className="px-3.5 py-2 rounded-lg text-xs font-medium transition-all btn-press"
            style={{
              background: filter === cat.id ? "var(--accent-dim)" : "var(--card)",
              border: `1px solid ${filter === cat.id ? "var(--accent)" + "44" : "var(--border-light)"}`,
              color: filter === cat.id ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {filtered.map((item) => {
          const owned = isPurchased(item.id);
          const canAfford = profile.xp >= item.cost;
          return (
            <div
              key={item.id}
              className="rounded-xl border bg-[var(--card)] p-5 transition-all card-hover"
              style={{ borderColor: owned ? "var(--green)" : "var(--border-light)", opacity: owned ? 0.7 : 1 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">{item.icon}</div>
                {owned && (
                  <span className="text-[10px] font-semibold text-[var(--green)] bg-[var(--green-dim)] px-2 py-0.5 rounded">
                    OWNED
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{item.name}</h3>
              <p className="text-[12px] text-[var(--text-muted)] mb-4">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--accent)]">{item.cost.toLocaleString()} XP</span>
                {!owned && (
                  <button
                    onClick={() => buyItem(item)}
                    disabled={!canAfford}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all btn-press disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: canAfford ? "var(--accent)" : "var(--border)",
                      color: canAfford ? "#191919" : "var(--text-muted)",
                    }}
                  >
                    Buy
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Purchased count */}
      <div className="mt-8 text-center text-[11px] text-[var(--text-muted)]">
        {purchases.length} of {SHOP_ITEMS.length} items owned
      </div>
    </div>
  );
}
