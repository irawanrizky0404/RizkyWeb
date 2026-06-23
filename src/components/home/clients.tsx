import { Marquee } from "@/components/ui/marquee";

interface ClientsProps {
  clients: string[];
}

export function Clients({ clients: clientList }: ClientsProps) {
  return (
    <section className="border-t border-rule py-10 md:py-12">
      <div className="mb-6 flex items-center justify-between border-b border-rule pb-3 px-5 md:px-8">
        <span className="fac">FAC.06</span>
        <span className="lab text-signal">{clientList.length} collaborators</span>
      </div>

      <Marquee>
        {clientList.map((name) => (
          <span key={name} className="flex items-center">
            <span
              className="dis text-signal transition-colors hover:text-white"
              style={{ fontSize: "clamp(1.4rem, 3vw, 2.4rem)", whiteSpace: "nowrap", lineHeight: 1 }}
            >
              {name}
            </span>
            <span className="mx-8 text-signal/50" style={{ fontSize: "0.5rem" }}>✦</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
