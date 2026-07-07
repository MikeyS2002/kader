import { StudioMap } from "@/components/studio-map";
import { studios } from "@/lib/studios";

export const metadata = {
  title: {
    absolute: "Kader — studio huren: foto, video & podcast op één kaart",
  },
  description: `${studios.length} studio's te huur in Nederland en België. Filter op limbowand, daglicht of parkeren en vergelijk prijzen per uur en per dag — alles op één kaart.`,
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="h-dvh w-full">
      {/* crawlbare kop en intro — de kaart zelf is client-side */}
      <h1 className="sr-only">
        Studio huren: foto, video en podcast op één kaart
      </h1>
      <p className="sr-only">
        {`Kader toont ${studios.length} huurbare studio's in Nederland en België, met specs als oppervlakte, plafondhoogte, limbowand, greenscreen, daglicht en parkeren, en prijzen per uur, dag en week.`}
      </p>
      <StudioMap />
    </main>
  );
}
