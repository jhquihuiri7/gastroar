import type { Lang, Strings } from "@/lib/i18n";
import type { CategoryId, Dish, MenuCategory } from "@/lib/menu-data";
import { dishInitials } from "@/lib/menu-data";
import { tagStyle } from "@/lib/tag-color";
import { IconBell, IconCube, IconGlobe } from "@/components/icons";

interface Props {
  t: Strings;
  lang: Lang;
  cat: CategoryId;
  categories: MenuCategory[];
  dishes: Dish[];
  onPickCat: (cat: CategoryId) => void;
  onOpenDish: (id: string) => void;
  onView3d: (id: string) => void;
  onViewOnTable: (id: string) => void;
  onOpenLangSheet: () => void;
  onOpenWaiterSheet: () => void;
}

export default function MenuScreen({
  t,
  lang,
  cat,
  categories,
  dishes,
  onPickCat,
  onOpenDish,
  onView3d,
  onViewOnTable,
  onOpenLangSheet,
  onOpenWaiterSheet,
}: Props) {
  const activeCategory = categories.find((c) => c.id === cat);
  return (
    <div
      className="menu anim-fade-up"
      data-screen-root="menu"
      tabIndex={-1}
      aria-label={t.menuCategories}
    >
      <header className="menu__header">
        <div className="menu__id">
          <div className="brand brand--sm">
            <span className="brand__serif">Gastro</span>
            <span className="brand__ar">AR</span>
          </div>
          <div className="menu__table">{t.tableChip}</div>
        </div>
        <div className="menu__actions">
          <button type="button" className="pill-btn" onClick={onOpenLangSheet}>
            <IconGlobe size={13} strokeWidth={1.8} />
            {lang.toUpperCase()}
          </button>
          <button
            type="button"
            className="icon-btn"
            title={t.optWaiter}
            aria-label={t.optWaiter}
            onClick={onOpenWaiterSheet}
          >
            <IconBell size={15} strokeWidth={1.8} className="acc" />
          </button>
        </div>
      </header>

      <nav className="cats" aria-label={t.menuCategories}>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`cat-chip${cat === c.id ? " cat-chip--active" : ""}`}
            aria-pressed={cat === c.id}
            onClick={() => onPickCat(c.id)}
          >
            {c.label}
          </button>
        ))}
      </nav>

      <div className="menu__scroll">
        <div className="menu__section-head">
          <h2 className="menu__title">{activeCategory?.label}</h2>
          <div className="menu__count">
            {dishes.length} {t.dishesWord}
          </div>
        </div>

        <div className="dish-list">
          {dishes.map((d) => {
            const hasModel = Boolean(d.modelGlbUrl);

            return (
              <article key={d.id} className="dish-card">
                <div className="dish-card__summary">
                  {d.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="dish-card__thumb" src={d.imageUrl} alt="" />
                  ) : (
                    <div className="dish-card__mono" aria-hidden="true">
                      <div className="dish-card__mono-ring">{dishInitials(d.name)}</div>
                    </div>
                  )}
                  <div className="dish-card__body">
                    <div className="dish-card__row">
                      <h3 className="dish-card__name">
                        <button type="button" className="dish-card__open" onClick={() => onOpenDish(d.id)}>
                          {d.name}
                        </button>
                      </h3>
                      <div className="dish-card__price">${d.price}</div>
                    </div>
                    <p className="dish-card__desc">{d.desc}</p>
                    <div className="dish-card__foot">
                      {d.tags.map((tg) => (
                        <span key={tg} className="tag" style={tagStyle(tg)}>
                          {tg.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="dish-card__experience-actions">
                  <button
                    type="button"
                    className="experience-btn"
                    data-experience-trigger={`${d.id}:viewer3d`}
                    disabled={!hasModel}
                    title={!hasModel ? t.modelActionsUnavailable : undefined}
                    onClick={() => onView3d(d.id)}
                  >
                    <IconCube size={13} />
                    {t.viewIn3d}
                  </button>
                  <button
                    type="button"
                    className="experience-btn experience-btn--primary"
                    data-experience-trigger={`${d.id}:table`}
                    disabled={!hasModel}
                    title={!hasModel ? t.modelActionsUnavailable : undefined}
                    onClick={() => onViewOnTable(d.id)}
                  >
                    <IconCube size={13} />
                    {t.viewOnTable}
                  </button>
                  {!hasModel && <span className="dish-card__model-note">{t.modelActionsUnavailable}</span>}
                </div>
              </article>
            );
          })}
        </div>

        <div className="menu__note">
          <span className="live-dot live-dot--static" />
          {t.menuModelNote}
        </div>
      </div>
    </div>
  );
}
