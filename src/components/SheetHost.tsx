import type { Lang, Strings } from "@/lib/i18n";
import { LANGS } from "@/lib/i18n";
import { IconCheck, IconChevronRight } from "@/components/icons";

export type SheetKind = "lang" | "waiter";

interface Props {
  sheet: SheetKind;
  t: Strings;
  lang: Lang;
  onPickLang: (lang: Lang) => void;
  onWaiterRequest: () => void;
  onClose: () => void;
}

export default function SheetHost({ sheet, t, lang, onPickLang, onWaiterRequest, onClose }: Props) {
  const waiterOpts = [
    { icon: "🛎", label: t.optWaiter },
    { icon: "🧾", label: t.optBill },
    { icon: "💧", label: t.optWater },
  ];

  return (
    <div className="sheet" role="dialog" aria-modal="true">
      <div className="sheet__scrim anim-fade-in" onClick={onClose} />
      <div className="sheet__panel">
        <div className="sheet__handle" />

        {sheet === "lang" && (
          <>
            <div className="sheet__title">{t.chooseLangTitle}</div>
            <div className="sheet__list">
              {LANGS.map((L) => (
                <button
                  key={L.l}
                  type="button"
                  className={`sheet-row${lang === L.l ? " sheet-row--active" : ""}`}
                  onClick={() => onPickLang(L.l)}
                >
                  <span className="sheet-row__code">{L.code}</span>
                  <span className="sheet-row__label">{L.native}</span>
                  {lang === L.l && <IconCheck size={16} strokeWidth={2.2} className="acc" />}
                </button>
              ))}
            </div>
          </>
        )}

        {sheet === "waiter" && (
          <>
            <div className="sheet__title">{t.waiterTitle}</div>
            <div className="sheet__sub">{t.waiterSub}</div>
            <div className="sheet__list">
              {waiterOpts.map((o) => (
                <button key={o.label} type="button" className="sheet-row" onClick={onWaiterRequest}>
                  <span className="sheet-row__icon">{o.icon}</span>
                  <span className="sheet-row__label">{o.label}</span>
                  <IconChevronRight size={14} className="faint" />
                </button>
              ))}
            </div>
            <button type="button" className="sheet__cancel" onClick={onClose}>
              {t.cancel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
