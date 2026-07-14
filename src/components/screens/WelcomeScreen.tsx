import type { Lang, Strings } from "@/lib/i18n";
import { LANGS } from "@/lib/i18n";
import { IconArrowRight, IconQr } from "@/components/icons";

interface Props {
  t: Strings;
  lang: Lang;
  onPickLang: (lang: Lang) => void;
  onOpenMenu: () => void;
}

export default function WelcomeScreen({ t, lang, onPickLang, onOpenMenu }: Props) {
  return (
    <div
      className="welcome anim-fade-in"
      data-screen-root="welcome"
      tabIndex={-1}
      aria-labelledby="welcome-title"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="welcome__bg" src="/assets/ar-bg.jpg" alt="" />
      <div className="welcome__scrim" />

      <div className="welcome__top">
        <div className="chip">{t.tableChip}</div>
        <div className="live-note">
          <span className="live-dot" />
          {t.webApp}
        </div>
      </div>

      <div className="welcome__body">
        <div className="brand brand--lg">
          <span className="brand__serif">Gastro</span>
          <span className="brand__ar">AR</span>
        </div>
        <div className="welcome__sub">FINE DINING · GALÁPAGOS</div>
        <h1 id="welcome-title" className="welcome__tagline">
          {t.tagline}
        </h1>
        <div className="welcome__rule" />
        <div className="welcome__label">{t.chooseLang}</div>
        <div className="lang-row">
          {LANGS.map((L) => (
            <button
              key={L.l}
              type="button"
              className={`lang-pill${lang === L.l ? " lang-pill--active" : ""}`}
              onClick={() => onPickLang(L.l)}
            >
              {L.native}
            </button>
          ))}
        </div>
        <button type="button" className="btn-primary welcome__cta" onClick={onOpenMenu}>
          {t.openMenu}
          <IconArrowRight size={15} strokeWidth={2.2} />
        </button>
        <div className="welcome__qr-note">
          <IconQr size={12} />
          {t.scannedNote}
        </div>
      </div>
    </div>
  );
}
