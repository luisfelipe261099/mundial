import Link from "next/link";
import { business, fullAddress, whatsappUrl } from "../../_data/business";
import { InstagramIcon } from "./ui";

export function Footer() {
  return (
    <footer className="border-t border-[var(--linha)] bg-[var(--cimento)] pb-20 md:pb-0">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-[var(--font-work)] font-bold text-[var(--tinta)]">{business.name}</p>
            <p className="t-small mt-2 max-w-[36ch] text-[var(--tinta-2)]">{fullAddress}</p>
          </div>
          <div>
            <p className="t-small font-semibold text-[var(--tinta-2)]">Contato</p>
            <ul className="t-small mt-2 space-y-1.5">
              <li>
                <a href={business.phoneHref} className="text-[var(--azul-link)] underline underline-offset-4">
                  Fixo {business.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--azul-link)] underline underline-offset-4"
                >
                  WhatsApp {business.whatsappDisplay}
                </a>
              </li>
              <li>
                <a
                  href={business.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[var(--azul-link)] underline underline-offset-4"
                >
                  <InstagramIcon size={14} />
                  {business.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="t-small font-semibold text-[var(--tinta-2)]">Horário</p>
            <ul className="t-small mt-2 space-y-1.5 text-[var(--tinta-2)]">
              {business.hours.map((h) => (
                <li key={h.days}>
                  {h.days}: {h.time}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--linha)] pt-6">
          <p className="t-small text-[var(--tinta-3)]">
            © {new Date().getFullYear()} {business.name} — {business.address.city}/{business.address.state}
          </p>
          <Link href="/login" className="t-small text-[var(--tinta-3)] hover:text-[var(--tinta-2)]">
            Área restrita
          </Link>
        </div>
      </div>
    </footer>
  );
}
