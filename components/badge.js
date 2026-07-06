import clsx from "clsx";

/* Badge atom — mono spec-label, zoals op de listing card.
 *
 * <Badge variant="flag">FOTO · NOORD</Badge>
 * <Badge variant="gel">VIDEO</Badge>
 *
 * flag    standaard, op foto's
 * gel     video-listings
 * chroma  alleen voor status "beschikbaar"-achtige accenten
 * papier  neutrale placeholders
 */

const VARIANT_CLASSES = {
  flag: "bg-flag text-cyc",
  gel: "bg-gel text-white",
  chroma: "bg-chroma text-flag",
  papier: "bg-papier text-flag",
};

export const Badge = ({ variant = "flag", className, children, ...props }) => {
  if (process.env.NODE_ENV === "development" && !VARIANT_CLASSES[variant]) {
    console.warn(
      `[Badge] Onbekende variant "${variant}". Verwacht: ${Object.keys(VARIANT_CLASSES).join(", ")}.`
    );
  }

  return (
    <span
      className={clsx(
        "inline-block w-fit rounded-md px-2.5 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase select-none",
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.flag,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
