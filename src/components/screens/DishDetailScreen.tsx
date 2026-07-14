import type { Strings } from "@/lib/i18n";
import type { Dish } from "@/lib/menu-data";
import { dishInitials } from "@/lib/menu-data";
import { tagStyle } from "@/lib/tag-color";
import { IconBack, IconBell, IconCube } from "@/components/icons";

interface Props {
  t: Strings;
  dish: Dish;
  onBack: () => void;
  onView3d: () => void;
  onViewOnTable: () => void;
  onOpenWaiterSheet: () => void;
}

export default function DishDetailScreen({
  t,
  dish,
  onBack,
  onView3d,
  onViewOnTable,
  onOpenWaiterSheet,
}: Props) {
  const hasModel = Boolean(dish.modelGlbUrl);

  return (
    <div
      className="detail anim-fade-up"
      data-screen-root="detail"
      tabIndex={-1}
      aria-labelledby="dish-detail-title"
    >
      <div className="detail__hero">
        {dish.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="detail__hero-img" src={dish.imageUrl} alt="" />
        ) : (
          <div className="detail__mono">
            <div className="detail__mono-ring">{dishInitials(dish.name)}</div>
            <div className="detail__mono-note">{t.photoSoon}</div>
          </div>
        )}
        <div className="detail__scrim" />
        <button type="button" className="hud-btn detail__back" aria-label={t.back} onClick={onBack}>
          <IconBack size={16} />
        </button>
        <button
          type="button"
          className="hud-btn detail__waiter acc"
          aria-label={t.optWaiter}
          onClick={onOpenWaiterSheet}
        >
          <IconBell size={16} strokeWidth={1.8} />
        </button>
      </div>

      <div className="detail__scroll">
        <div className="detail__tags">
          {dish.tags.map((tg) => (
            <span key={tg} className="tag tag--lg" style={tagStyle(tg)}>
              {tg.toUpperCase()}
            </span>
          ))}
        </div>
        <div className="detail__titlerow">
          <h1 id="dish-detail-title" className="detail__name">
            {dish.name}
          </h1>
          <div className="detail__price">${dish.price}</div>
        </div>
        <p className="detail__desc">{dish.desc}</p>
        <div className="detail__label">{t.ingredients}</div>
        <div className="ing-list">
          {dish.ing.map((ig) => (
            <span key={ig} className="ing">
              {ig}
            </span>
          ))}
        </div>
      </div>

      <div className="detail__cta-wrap">
        <div className="detail__cta-actions">
          <button
            type="button"
            className="btn-secondary"
            data-experience-trigger={`${dish.id}:viewer3d`}
            disabled={!hasModel}
            onClick={onView3d}
          >
            <IconCube size={16} strokeWidth={2.1} />
            {t.viewIn3d}
          </button>
          <button
            type="button"
            className="btn-primary"
            data-experience-trigger={`${dish.id}:table`}
            disabled={!hasModel}
            onClick={onViewOnTable}
          >
            <IconCube size={16} strokeWidth={2.1} />
            {t.viewOnTable}
          </button>
        </div>
        <div className="detail__cta-note">{hasModel ? t.placeDish : t.modelActionsUnavailable}</div>
      </div>
    </div>
  );
}
