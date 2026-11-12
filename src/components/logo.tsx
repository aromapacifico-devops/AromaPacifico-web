import Image from "next/image";

export function Logo({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  return (
    <span className={`brand-logo ${inverse ? "brand-logo--inverse" : ""}`}>
      <Image src="/brand/aroma-mark.svg" width={38} height={38} alt="" aria-hidden="true" priority />
      {!compact && <span className="brand-wordmark">AROMA<span>PACÍFICO</span></span>}
    </span>
  );
}
