"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { STR, detectBrowserLang, stringsForTable, type Lang } from "@/lib/i18n";
import { CATEGORY_IDS, DISHES, type CategoryId } from "@/lib/menu-data";
import { DEFAULT_AR_MARKER, normalizeTableId } from "@/lib/ar-config";
import WelcomeScreen from "./screens/WelcomeScreen";
import MenuScreen from "./screens/MenuScreen";
import DishDetailScreen from "./screens/DishDetailScreen";
import ArViewScreen from "./screens/ArViewScreen";
import SheetHost, { type SheetKind } from "./SheetHost";
import Toast from "./Toast";

type Screen = "welcome" | "menu" | "detail" | "experience";

export default function GastroApp() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [lang, setLang] = useState<Lang>("en");
  const [cat, setCat] = useState<CategoryId>("starters");
  const [dishId, setDishId] = useState("scallops");
  const [tableId, setTableId] = useState<string | undefined>();
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [toast, setToast] = useState({ msg: "", on: false });

  const experienceReturn = useRef<Screen>("menu");
  const pendingFocusSelector = useRef<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = useMemo(() => stringsForTable(STR[lang], tableId), [lang, tableId]);
  const dish = DISHES.find((d) => d.id === dishId) ?? DISHES[0];
  const dishes = DISHES.filter((d) => d.cat === cat);
  const categories = useMemo(
    () => CATEGORY_IDS.map((id) => ({ id, label: t.cats[id as keyof typeof t.cats] })),
    [t],
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setLang(detectBrowserLang());
      setTableId(normalizeTableId(new URLSearchParams(window.location.search).get("table")));
    });
    return () => cancelAnimationFrame(frame);
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

  const startExperience = (id: string, from: Screen) => {
    experienceReturn.current = from;
    setDishId(id);
    setScreen("experience");
  };

  const closeExperience = () => {
    pendingFocusSelector.current = `[data-experience-trigger="${dish.id}:table"]`;
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
          dishes={dishes}
          onPickCat={setCat}
          onOpenDish={(id) => {
            setDishId(id);
            setScreen("detail");
          }}
          onViewOnTable={(id) => startExperience(id, "menu")}
          onOpenLangSheet={() => setSheet("lang")}
          onOpenWaiterSheet={() => setSheet("waiter")}
        />
      )}

      {screen === "detail" && (
        <DishDetailScreen
          t={t}
          dish={dish}
          onBack={() => setScreen("menu")}
          onViewOnTable={() => startExperience(dish.id, "detail")}
          onOpenWaiterSheet={() => setSheet("waiter")}
        />
      )}

      {screen === "experience" && (
        <ArViewScreen
          key={dish.id}
          t={t}
          dish={dish}
          marker={DEFAULT_AR_MARKER}
          tableId={tableId}
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
