import clsx from "clsx";

/* Button atom — variant-map naar het vast-design-system patroon.
 *
 * <Button variant="primary" label="Bekijk studio" />
 * <Button variant="ghost" label="Bewaar" as="a" href="/bewaard" />
 *
 * primary  Chroma — de enige die om aandacht mag vragen, max één per scherm
 * ghost    currentColor — kleurt automatisch mee op elke themed surface
 * dark     Flag — voor lichte vlakken waar Chroma al is gebruikt
 *
 * Hover: een "rol achtergrondpapier" valt van boven naar beneden door de
 * knop (met een subtiele papier-curve als onderrand) terwijl het label
 * eruit rolt en er opnieuw in schuift. Alleen op hover-apparaten
 * (pointer:) en voor toetsenbord-focus.
 */

const VARIANT_CLASSES = {
  primary: "bg-chroma text-flag",
  ghost: "bg-transparent text-foreground border-[1.5px] border-foreground",
  dark: "bg-flag text-cyc",
};

/* De kleur van het papier dat naar beneden rolt … */
const FILL_CLASSES = {
  primary: "bg-flag",
  ghost: "bg-foreground",
  dark: "bg-cyc",
};

/* … en de tekstkleur die daarbij hoort. */
const HOVER_TEXT_CLASSES = {
  primary: "pointer:group-hover:text-cyc group-focus-visible:text-cyc",
  ghost:
    "pointer:group-hover:text-background group-focus-visible:text-background",
  dark: "pointer:group-hover:text-flag group-focus-visible:text-flag",
};

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

export const Button = ({
  label,
  variant = "primary",
  as,
  href,
  onClick,
  disabled = false,
  type = "button",
  className,
  children,
  ...props
}) => {
  const Component = as ?? (href ? "a" : "button");
  const content = children ?? label;

  if (process.env.NODE_ENV === "development" && !VARIANT_CLASSES[variant]) {
    console.warn(
      `[Button] Onbekende variant "${variant}". Verwacht: ${Object.keys(VARIANT_CLASSES).join(", ")}.`
    );
  }

  return (
    <Component
      className={clsx(
        "group focusable relative inline-flex w-fit cursor-pointer items-center justify-center overflow-hidden rounded-full px-[18px] py-xs font-sans text-[15px] font-semibold",
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary,
        disabled && "pointer-events-none opacity-50",
        className
      )}
      href={href || undefined}
      onClick={onClick}
      type={Component === "button" ? type : undefined}
      disabled={Component === "button" ? disabled : undefined}
      {...props}
    >
      {/* de papier-rol */}
      <span
        aria-hidden
        className={clsx(
          "absolute left-0 top-[-80%] h-[180%] w-full -translate-y-[130%] rounded-b-[50%_18px]",
          `transition-transform duration-500 ${EASE} motion-reduce:transition-none`,
          "pointer:group-hover:translate-y-[22px] group-focus-visible:translate-y-[22px]",
          FILL_CLASSES[variant] ?? FILL_CLASSES.primary
        )}
      />
      {/* het rollende label */}
      <span
        className={clsx(
          "relative z-[1] overflow-hidden transition-colors duration-300 motion-reduce:transition-none",
          HOVER_TEXT_CLASSES[variant] ?? HOVER_TEXT_CLASSES.primary
        )}
      >
        <span
          className={clsx(
            "block whitespace-nowrap",
            `transition-transform duration-[400ms] ${EASE} motion-reduce:transition-none`,
            "pointer:group-hover:-translate-y-[120%] group-focus-visible:-translate-y-[120%]"
          )}
        >
          {content}
        </span>
        <span
          aria-hidden
          className={clsx(
            "absolute inset-0 block translate-y-[120%] whitespace-nowrap",
            `transition-transform duration-[400ms] ${EASE} motion-reduce:transition-none`,
            "pointer:group-hover:translate-y-0 group-focus-visible:translate-y-0"
          )}
        >
          {content}
        </span>
      </span>
    </Component>
  );
};
