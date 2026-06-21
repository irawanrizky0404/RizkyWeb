import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/ui/reveal";

const clients = [
  { name: "Cooldown", file: "Cooldown.png" },
  { name: "Engelsen Frame", file: "Engelsen Frame Website.png" },
  { name: "Faralda", file: "Faralda.png" },
  { name: "Farrah Gray Advisors", file: "Farrah Gray Advisors Capital Coaching - png.png" },
  { name: "Gobo Revolution", file: "Gobo Revolution.png" },
  { name: "Jims Pay Plan", file: "Jims-Pay-Plan_logo-300x197.png" },
  { name: "Legal Touch", file: "Legal Touch.png" },
  { name: "Rafala Zajaca", file: "Rafala Zajaca.png" },
  { name: "Roombase", file: "Roombase.png" },
  { name: "Scogen", file: "scogen-logo-footer.png" },
  { name: "Se", file: "Se.png" },
  { name: "Shapeys", file: "Shapeys.png" },
  { name: "Steelwerks", file: "Steelwerks.png" },
  { name: "VH", file: "VH 2.png" },
  { name: "Zero Sweet", file: "Zero Sweet.png" },
];

export function Clients() {
  return (
    <section className="px-6 py-20 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1800px]">
        <SectionHeader
          label="Clients"
          title="Trusted by"
          description="A selection of brands and studios I've worked with."
        />

        <Reveal delay={0.2}>
          <div className="mt-16 grid grid-cols-2 border-l border-t border-border sm:grid-cols-3 md:grid-cols-5">
            {clients.map((client) => (
              <div
                key={client.name}
                className="flex h-28 items-center justify-center border-b border-r border-border bg-background p-6 transition-colors duration-300 hover:bg-muted md:h-40 md:p-10"
              >
                <Image
                  src={`/images/clients/${client.file}`}
                  alt={client.name}
                  width={260}
                  height={100}
                  className="max-h-12 w-auto object-contain brightness-0 invert opacity-50 transition-all duration-300 hover:opacity-100 md:max-h-20"
                />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
