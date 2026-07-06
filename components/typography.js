import clsx from "clsx";

/* Typography atom — naar het vast-design-system patroon.
 *
 * <Typography type="h2">Kop</Typography>
 * <Typography type="body-l" as="div">Intro</Typography>
 * <Typography type="spec">120 m² · vanaf €65/uur</Typography>
 */

export const TYPOGRAPHY_TYPES = [
  "display",
  "h1",
  "h2",
  "h3",
  "body-l",
  "body-m",
  "eyebrow",
  "label",
  "spec",
  "caption",
];

const TYPE_CLASS = {
  display: "type-display",
  h1: "type-h1",
  h2: "type-h2",
  h3: "type-h3",
  "body-l": "type-body-l",
  "body-m": "type-body-m",
  eyebrow: "type-eyebrow",
  label: "type-label",
  spec: "type-spec",
  caption: "type-caption",
};

const DEFAULT_ELEMENT = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  "body-l": "p",
  "body-m": "p",
  eyebrow: "span",
  label: "span",
  spec: "span",
  caption: "p",
};

export const Typography = ({
  type = "body-m",
  as,
  className,
  children,
  href,
  ...props
}) => {
  const Component = as ?? (href ? "a" : DEFAULT_ELEMENT[type]);

  if (process.env.NODE_ENV === "development" && !TYPE_CLASS[type]) {
    console.warn(
      `[Typography] Onbekend type "${type}". Verwacht: ${TYPOGRAPHY_TYPES.join(", ")}.`
    );
  }

  return (
    <Component
      className={clsx(TYPE_CLASS[type], href && "underline", className)}
      href={href || undefined}
      {...props}
    >
      {children}
    </Component>
  );
};

/* Mono kicker boven een kop: <Eyebrow>01 — Naam</Eyebrow> */
export const Eyebrow = ({ className, children, ...props }) => (
  <Typography
    type="eyebrow"
    className={clsx("block opacity-55", className)}
    {...props}
  >
    {children}
  </Typography>
);
