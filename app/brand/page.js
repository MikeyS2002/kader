import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { KaderMark } from "@/components/kader-mark";
import { Eyebrow, Typography } from "@/components/typography";

const COLORS = [
  { name: "Cyc", hex: "#EDEDEA", use: "Achtergrond, rust, ruimte", border: true },
  { name: "Flag", hex: "#171716", use: "Tekst, contrast, gewicht" },
  { name: "Chroma", hex: "#00B140", use: "Knoppen, links, focus — spaarzaam" },
  { name: "Gel", hex: "#2F4DE0", use: "Datavisualisatie, badges video" },
  { name: "Papier", hex: "#D8CBB8", use: "Zachte vlakken, placeholders" },
];

export const metadata = {
  title: "Brand — Kader",
  description:
    "Kader brand identity v1: naam, logo, kleur, typografie en tone of voice.",
};

export default function BrandPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-10">
      {/* ---------- HERO ---------- */}
      <section className="pt-20 pb-2xl sm:pt-28 sm:pb-3xl">
        <div className="mb-8 flex flex-wrap items-end gap-x-7 gap-y-4 sm:mb-9">
          <KaderMark className="h-20 w-20 sm:h-24 sm:w-24" />
          <span className="font-display text-[clamp(64px,13vw,150px)] font-extrabold leading-[0.9] tracking-[-0.045em] lowercase">
            kader
          </span>
          <Typography type="spec" className="pb-2 tracking-[0.06em] opacity-65 sm:pb-3.5">
            elke studio in beeld
          </Typography>
        </div>
        <Typography type="body-l" className="max-w-[660px]">
          Kader is de plek waar makers hun volgende studio vinden: foto, video en
          podcast, op één kaart, zonder gedoe. Het merk leent alles van de
          studiovloer zelf — de witte cyclorama, de zwarte flags,
          greenscreen-groen en rollen achtergrondpapier.
        </Typography>
      </section>

      {/* ---------- 01 NAAM ---------- */}
      <Section num="01" title="Naam" heading='Waarom "Kader"'>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <div data-theme="white" className="cyc-shape border border-line bg-background p-8 sm:p-9">
            <div className="font-display text-3xl font-bold tracking-[-0.02em]">
              ka·der
            </div>
            <Typography type="caption" className="mt-0.5 opacity-55">
              /ˈkaːdər/ · het · zn.
            </Typography>
            <ol className="mt-5 list-none">
              {[
                "de rand waarbinnen je een beeld vangt — wat een fotograaf de hele dag doet",
                "een structuur die houvast geeft — wat het platform doet met een versnipperd aanbod",
              ].map((li, i) => (
                <li
                  key={i}
                  className="flex gap-3.5 border-t border-dashed border-line py-2.5 text-base"
                >
                  <span className="font-mono text-xs font-medium text-chroma">
                    {i + 1}
                  </span>
                  <span>{li}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p>
              Eén Nederlands woord, twee betekenissen die allebei precies
              kloppen. Kort, uitspreekbaar, en het klinkt als een merk in plaats
              van een zoekterm — de SEO gebeurt op de pagina&apos;s
              (&quot;fotostudio huren Amsterdam&quot;), niet in de naam.
            </p>
            <p className="mt-4 text-[15px] opacity-70">
              Domein-tip: <strong>kader.studio</strong> — de .studio-extensie ís
              hier de merkzin. Check ook kaderstudios.nl als NL-fallback.
              Beschikbaarheid uiteraard eerst verifiëren.
            </p>
          </div>
        </div>
      </Section>

      {/* ---------- 02 LOGO ---------- */}
      <Section num="02" title="Logo" heading="Het beeldmerk: een cyclorama-kader">
        <Typography type="body-l" className="max-w-[42ch]">
          Een frame dat bovenaan strak is en onderaan wegvloeit in een curve — de
          doorsnede van een cyclorama-wand, en tegelijk een zoeker waar het
          onderwerp (de groene stip: jouw studio) in beeld staat.
        </Typography>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LogoTile theme="white" />
          <LogoTile theme="flag" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Rule>
            <b>Altijd lowercase.</b> &quot;kader&quot;, nooit &quot;KADER&quot; of
            &quot;Kader&quot; in het logo.
          </Rule>
          <Rule>
            <b>De stip is altijd Chroma-groen.</b> Op elke ondergrond, in elke
            variant.
          </Rule>
          <Rule>
            <b>Beeldmerk mag solo</b> als app-icoon of favicon; wordmark mag solo
            in lopende tekst.
          </Rule>
        </div>
      </Section>

      {/* ---------- 03 KLEUR ---------- */}
      <Section num="03" title="Kleur" heading="Palet van de studiovloer">
        <Typography type="body-l" className="max-w-[42ch]">
          Elke kleur bestaat echt in een studio. De swatches worden gepresenteerd
          zoals ze daar hangen: als rollen achtergrondpapier.
        </Typography>
        <div className="mt-9 flex flex-wrap items-end gap-4 sm:gap-[18px]">
          {COLORS.map((c) => (
            <Roll key={c.name} {...c} />
          ))}
        </div>
        <p className="mt-7 max-w-[640px] text-[15px] opacity-70">
          Regel: Chroma is de enige kleur die om aandacht mag vragen, en maximaal
          één keer per scherm. Al het andere blijft Cyc, Flag en Papier — zoals
          een studio zelf: neutraal, zodat het onderwerp opvalt.
        </p>
      </Section>

      {/* ---------- 04 TYPOGRAFIE ---------- */}
      <Section num="04" title="Typografie" heading="Drie stemmen">
        <div className="mt-2 flex flex-col gap-5">
          <TypeBlock label="Display — Bricolage Grotesque 700–800">
            <Typography type="h1" as="div">
              Vind je volgende studio.
            </Typography>
            <p className="mt-3.5 text-sm opacity-60">
              Voor koppen en het wordmark. Karakter zonder gimmicks; strakke
              letterspatiëring (−3 à −4%).
            </p>
          </TypeBlock>
          <TypeBlock label="Body — Instrument Sans 400–600">
            <Typography type="body-l" className="max-w-[640px]">
              Voor alle lopende tekst en interface-elementen. Neutraal, goed
              leesbaar op mobiel, en het houdt zijn mond zodat de foto&apos;s van
              de studio&apos;s het werk doen.
            </Typography>
          </TypeBlock>
          <TypeBlock label="Data — Spline Sans Mono 400–500">
            <Typography type="spec" as="p">
              120 m² &nbsp;·&nbsp; plafond 4,2 m &nbsp;·&nbsp; vanaf €65/uur
              &nbsp;·&nbsp; limbowand
            </Typography>
            <p className="mt-3.5 text-sm opacity-60">
              Voor specs, prijzen en labels — de &quot;meetgegevens&quot; van een
              studio verdienen een technische stem. Alle drie via Google Fonts,
              gratis.
            </p>
          </TypeBlock>
        </div>
      </Section>

      {/* ---------- 05 TONE OF VOICE ---------- */}
      <Section num="05" title="Tone of voice" heading="Maker tegen maker">
        <Typography type="body-l" className="max-w-[42ch]">
          Kader praat zoals een bevriende fotograaf die de stad kent: direct,
          concreet, nul verkooppraat. Specificaties zijn het compliment — een
          studio hoeft niet &quot;prachtig&quot; te zijn als hij &quot;4,2 meter
          plafond en daglicht uit het noorden&quot; heeft.
        </Typography>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <VoiceCol title="Zo wel" tone="wel">
            {[
              "38 studio's in Amsterdam. Filter op limbowand, daglicht of parkeren.",
              "Vanaf €65 per uur. Boek direct bij de eigenaar.",
              "Geen resultaten met greenscreen in Utrecht. Probeer Amsterdam — 12 opties.",
            ]}
          </VoiceCol>
          <VoiceCol title="Zo niet" tone="niet">
            {[
              "Ontdek de mooiste inspirerende creatieve ruimtes van Nederland!",
              "Jouw droomshoot begint hier ✨",
              "Oeps! Er ging iets mis 🙈",
            ]}
          </VoiceCol>
        </div>
      </Section>

      {/* ---------- 06 IN GEBRUIK ---------- */}
      <Section num="06" title="In gebruik" heading="De listing card">
        <Typography type="body-l" className="max-w-[42ch]">
          Alles komt samen in het belangrijkste component: bovenkant strak,
          onderkant met de cyc-curve. De foto krijgt de ruimte, de specs staan in
          mono, en er is precies één groene knop.
        </Typography>
        <div
          data-theme="flag"
          className="cyc-shape mt-8 flex justify-center bg-background px-5 py-12 sm:px-8 sm:py-14"
        >
          <ListingCard />
        </div>
        <p className="mt-4 text-center text-sm opacity-60">
          De cyc-curve (10px boven, 34–44px onder) is het terugkerende
          vormprincipe voor cards, modals en beeldkaders — subtiel, maar overal
          herkenbaar.
        </p>
      </Section>

      {/* ---------- 07 SYSTEEM ---------- */}
      <Section num="07" title="Systeem" heading="Herbruikbare stijlen">
        <Typography type="body-l" className="max-w-[44ch]">
          Het merk is vertaald naar een klein design system: een typescale als
          <code className="type-caption"> type-*</code> classes, themed surfaces
          via <code className="type-caption">data-theme</code>, en atoms voor
          Typography, Button en Badge.
        </Typography>

        {/* Typescale */}
        <DemoBlock
          label="Typescale"
          usage='<Typography type="h2"> of class="type-h2"'
        >
          <div className="flex flex-col">
            {[
              ["type-display", "Aa"],
              ["type-h1", "Vind je volgende studio."],
              ["type-h2", "38 studio's in Amsterdam"],
              ["type-h3", "XYZ Studio A"],
              ["type-body-l", "Voor introteksten en leads onder een kop."],
              ["type-body-m", "Voor alle lopende tekst en interface-elementen."],
              ["type-eyebrow", "01 — sectie-kicker"],
              ["type-label", "Kaart-label"],
              ["type-spec", "120 m² · plafond 4,2 m · vanaf €65/uur"],
              ["type-caption", "Voetnoot of toelichting in mono."],
            ].map(([cls, sample]) => (
              <div
                key={cls}
                className="flex flex-col gap-1 border-t border-dashed border-line py-4 first:border-t-0 sm:flex-row sm:items-baseline sm:gap-6"
              >
                <code className="type-caption w-32 shrink-0 opacity-50">
                  {cls}
                </code>
                <span className={cls}>{sample}</span>
              </div>
            ))}
          </div>
        </DemoBlock>

        {/* Themed surfaces */}
        <DemoBlock
          label="Themed surfaces"
          usage='<div data-theme="flag" class="bg-background text-foreground">'
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {["cyc", "white", "papier", "flag", "chroma"].map((theme) => (
              <div
                key={theme}
                data-theme={theme}
                className="cyc-shape-s flex min-h-[190px] flex-col justify-between border border-line bg-background p-m text-foreground"
              >
                <div>
                  <Typography type="h3" as="div">
                    {theme}
                  </Typography>
                  <Typography type="caption" className="mt-1 opacity-60">
                    bg-background
                  </Typography>
                  <Typography type="caption" className="text-highlight">
                    text-highlight
                  </Typography>
                </div>
                <Button variant="ghost" label="Ghost knop" className="mt-4" />
              </div>
            ))}
          </div>
          <Typography type="caption" as="p" className="mt-4 opacity-60">
            De ghost-knop gebruikt text-foreground / border-foreground en kleurt
            dus vanzelf mee met elk thema.
          </Typography>
        </DemoBlock>

        {/* Buttons & badges */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <DemoBlock label="Button" usage='<Button variant="primary" label="…" />'>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" label="Bekijk studio" />
              <Button variant="ghost" label="Bewaar" />
              <Button variant="dark" label="Contact" />
              <Button variant="primary" label="Geboekt" disabled />
            </div>
            <Typography type="caption" as="p" className="mt-4 opacity-60">
              primary · ghost · dark · disabled — max één Chroma-knop per scherm.
            </Typography>
          </DemoBlock>

          <DemoBlock label="Badge" usage='<Badge variant="gel">VIDEO</Badge>'>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="flag">Foto · Noord</Badge>
              <Badge variant="gel">Video</Badge>
              <Badge variant="chroma">Beschikbaar</Badge>
              <Badge variant="papier">Podcast</Badge>
            </div>
            <Typography type="caption" as="p" className="mt-4 opacity-60">
              flag · gel · chroma · papier — mono, caps, zoals op de listing
              card.
            </Typography>
          </DemoBlock>
        </div>

        {/* Spacing */}
        <DemoBlock label="Spacing" usage='class="gap-s p-l py-3xl"'>
          <div className="flex flex-col gap-2">
            {["3xs", "2xs", "xs", "s", "m", "l", "xl", "2xl", "3xl", "4xl"].map(
              (token) => (
                <div key={token} className="flex items-center gap-4">
                  <code className="type-caption w-10 shrink-0 opacity-50">
                    {token}
                  </code>
                  <div
                    className="h-3 rounded-sm bg-chroma/80"
                    style={{ width: `var(--spacing-${token})` }}
                  />
                </div>
              )
            )}
          </div>
        </DemoBlock>
      </Section>

      <footer className="border-t border-line py-11 pb-16">
        <Typography type="caption" className="opacity-55">
          kader — brand identity v1 · kleuren, type en vormen vrij te gebruiken
          in het project
        </Typography>
      </footer>
    </div>
  );
}

/* ---------- Bouwstenen ---------- */

function Section({ num, title, heading, children }) {
  return (
    <section className="border-t border-line py-2xl sm:py-3xl">
      <Eyebrow className="mb-5">
        {num} — {title}
      </Eyebrow>
      <h2 className="mb-4">{heading}</h2>
      {children}
    </section>
  );
}

function DemoBlock({ label, usage, children }) {
  return (
    <div data-theme="white" className="cyc-shape mt-6 border border-line bg-background p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <Typography type="label" className="opacity-50">
          {label}
        </Typography>
        <code className="type-caption opacity-40">{usage}</code>
      </div>
      {children}
    </div>
  );
}

function LogoTile({ theme }) {
  return (
    <div
      data-theme={theme}
      className="cyc-shape flex min-h-[220px] items-center justify-center border border-line bg-background p-10 text-foreground"
    >
      <div className="flex items-center gap-4">
        <KaderMark className="h-16 w-16" />
        <span className="font-display text-4xl font-extrabold tracking-[-0.04em] lowercase">
          kader
        </span>
      </div>
    </div>
  );
}

function Rule({ children }) {
  return (
    <div className="border border-line bg-white px-[18px] py-4 text-[15px]">
      {children}
    </div>
  );
}

function Roll({ name, hex, use, border }) {
  return (
    <div className="w-[calc(50%-8px)] sm:w-[150px]">
      <div
        className="relative z-[2] mb-[-4px] h-3.5 rounded-[7px] brightness-[0.85]"
        style={{ background: hex }}
      />
      <div
        className="h-[200px] rounded-b-[26px] shadow-[inset_0_14px_18px_-12px_rgba(0,0,0,0.28)] sm:h-[230px]"
        style={{
          background: hex,
          border: border ? "1px solid var(--color-line)" : undefined,
        }}
      />
      <div className="pt-3">
        <div className="text-[15px] font-semibold">{name}</div>
        <Typography type="caption" as="div" className="opacity-60">
          {hex}
        </Typography>
        <div className="mt-1 text-[13px] leading-snug opacity-70">{use}</div>
      </div>
    </div>
  );
}

function TypeBlock({ label, children }) {
  return (
    <div data-theme="white" className="cyc-shape border border-line bg-background p-7 sm:p-9">
      <Typography type="label" as="div" className="mb-3.5 opacity-50">
        {label}
      </Typography>
      {children}
    </div>
  );
}

function VoiceCol({ title, tone, children }) {
  return (
    <div data-theme="white" className="cyc-shape border border-line bg-background p-7 sm:p-8">
      <Typography
        type="label"
        as="h4"
        className={`mb-4 ${tone === "wel" ? "text-chroma" : "text-[#C0392B]"}`}
      >
        {title}
      </Typography>
      {children.map((line, i) => (
        <p
          key={i}
          className="border-t border-dashed border-line py-3 text-base first:border-t-0"
        >
          {line}
        </p>
      ))}
    </div>
  );
}

function ListingCard() {
  return (
    <div data-theme="white" className="cyc-shape-s w-full max-w-[420px] overflow-hidden bg-background">
      <div className="relative h-[200px] bg-[linear-gradient(160deg,#D8CBB8_0%,#EDE3D4_55%,#E4D7C3_100%)]">
        <Badge variant="flag" className="absolute left-3.5 top-3.5">
          Foto · Noord
        </Badge>
      </div>
      <div className="px-6 pb-6 pt-5">
        <h3>XYZ Studio A</h3>
        <div className="my-3 flex flex-wrap gap-3.5">
          {["140 m²", "limbowand", "gratis parkeren", "vanaf €275/dagdeel"].map(
            (s) => (
              <Typography key={s} type="spec" className="text-[12.5px] opacity-70">
                {s}
              </Typography>
            )
          )}
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="primary" label="Bekijk studio" />
          <Button variant="ghost" label="Bewaar" />
        </div>
      </div>
    </div>
  );
}
