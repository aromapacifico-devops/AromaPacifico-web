import Image from "next/image";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={`brand-logo ${inverse ? "brand-logo--inverse" : ""}`}>
      <Image
        src="/brand/aroma-pacifico-logo.png"
        width={610}
        height={180}
        sizes="(max-width: 600px) 118px, 142px"
        alt="Aroma Pacífico"
        priority
      />
    </span>
  );
}
