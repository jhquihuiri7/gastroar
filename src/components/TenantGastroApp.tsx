"use client";

import { useEffect, useRef, useState } from "react";
import { STR, detectBrowserLang, type Lang } from "@/lib/i18n";
import type { CategoryId, Dish, MenuCategory } from "@/lib/menu-data";
import WelcomeScreen from "./screens/WelcomeScreen";
import MenuScreen from "./screens/MenuScreen";
import DishDetailScreen from "./screens/DishDetailScreen";
import ArViewScreen, { type ExperienceIntent } from "./screens/ArViewScreen";
import SheetHost, { type SheetKind } from "./SheetHost";
import Toast from "./Toast";

type Screen = "welcome" | "menu" | "detail" | "experience";

interface Props {
  dishes: Dish[];
  categories: MenuCategory[];
}

/**
 * Same screen flow as GastroApp.tsx (the static demo at `/`), but menu data
 * comes from props — populated by src/app/r/[slug]/page.tsx from Firestore —
 * instead of the hardcoded DISHES/CATEGORY_IDS import. See plan Phase 5.
 */
export default function TenantGastroApp({ dishes, categories }: Props) {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [lang, setLang] = useState<Lang>("en");
  const [cat, setCat] = useState<CategoryId>(categories[0]?.id ?? "");
  const [dishId, setDishId] = useState(dishes[0]?.id ?? "");
  const [experienceIntent, setExperienceIntent] = useState<ExperienceIntent>("viewer3d");
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [toast, setToast] = useState({ msg: "", on: false });

  const experienceReturn = useRef<Screen>("menu");
  const pendingFocusSelector = useRef<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = STR[lang];
  const dish = dishes.find((d) => d.id === dishId) ?? dishes[0] ?? null;
  const visibleDishes = dishes.filter((d) => d.cat === cat);

  useEffect(() => {
    setLang(detectBrowserLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const pendingTarget = pendingFocusSelector.current
        ? document.querySelector<HTMLElement>(pendingFocusSelector.current)
        : null;
      const target = pendingTarget ?? document.querySelector<HTMLElement>(".shell [data-screen-root]");

      target?.focus({ preventScroll: true });
      if (pendingTarget) pendingFocusSelector.current = null;
    });

    return () => cancelAnimationFrame(frame);
  }, [screen]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const startExperience = (id: string, intent: ExperienceIntent, from: Screen) => {
    experienceReturn.current = from;
    setDishId(id);
    setExperienceIntent(intent);
    setScreen("experience");
  };

  const closeExperience = () => {
    if (dish) pendingFocusSelector.current = `[data-experience-trigger="${dish.id}:${experienceIntent}"]`;
    setScreen(experienceReturn.current);
  };

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, on: true });
    toastTimer.current = setTimeout(() => setToast((s) => ({ ...s, on: false })), 2600);
  };

  const pickLang = (l: Lang) => {
    setLang(l);
    setSheet(null);
  };

  return (
    <div className="shell">
      {screen === "welcome" && (
        <WelcomeScreen t={t} lang={lang} onPickLang={setLang} onOpenMenu={() => setScreen("menu")} />
      )}

      {screen === "menu" && (
        <MenuScreen
          t={t}
          lang={lang}
          cat={cat}
          categories={categories}
          dishes={visibleDishes}
          onPickCat={setCat}
          onOpenDish={(id) => {
            setDishId(id);
            setScreen("detail");
          }}
          onView3d={(id) => startExperience(id, "viewer3d", "menu")}
          onViewOnTable={(id) => startExperience(id, "table", "menu")}
          onOpenLangSheet={() => setSheet("lang")}
          onOpenWaiterSheet={() => setSheet("waiter")}
        />
      )}

      {screen === "detail" && dish && (
        <DishDetailScreen
          t={t}
          dish={dish}
          onBack={() => setScreen("menu")}
          onView3d={() => startExperience(dish.id, "viewer3d", "detail")}
          onViewOnTable={() => startExperience(dish.id, "table", "detail")}
          onOpenWaiterSheet={() => setSheet("waiter")}
        />
      )}

      {screen === "experience" && dish && (
        <ArViewScreen
          key={`${dish.id}:${experienceIntent}`}
          t={t}
          dish={dish}
          intent={experienceIntent}
          onClose={closeExperience}
          onOpenWaiterSheet={() => setSheet("waiter")}
        />
      )}

      {toast.on && <Toast message={toast.msg} />}

      {sheet && (
        <SheetHost
          sheet={sheet}
          t={t}
          lang={lang}
          onPickLang={pickLang}
          onWaiterRequest={() => {
            setSheet(null);
            showToast(t.waiterConfirm);
          }}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}
