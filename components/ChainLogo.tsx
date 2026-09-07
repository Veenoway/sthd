import { chainLabel, chainName } from "@/lib/chains";
import { cn } from "@/lib/cn";

export function ChainLogo({
  chain,
  size = 20,
  className,
  labeled = true,
}: {
  chain: string;
  size?: number;
  className?: string;
  labeled?: boolean;
}) {
  const key = chain.toLowerCase();
  const label = chainLabel(chain);

  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      title={label}
      aria-hidden={labeled ? undefined : true}
    >
      {labeled ? <span className="sr-only">{label}</span> : null}
      {key === "solana" ? (
        <SolanaMark size={size} />
      ) : key === "base" ? (
        <BaseMark size={size} />
      ) : key === "eth" || key === "ethereum" ? (
        <EthereumMark size={size} />
      ) : key === "robinhood" ? (
        <RobinhoodMark size={size} />
      ) : (
        <span
          aria-hidden
          className="block size-full rounded-full bg-card-2"
        />
      )}
    </span>
  );
}

export function ChainMark({
  chain,
  size = 16,
  className,
}: {
  chain: string;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <ChainLogo chain={chain} size={size} labeled={false} />
      <span className="whitespace-nowrap text-[13px]">{chainName(chain)}</span>
    </span>
  );
}

export function ChainPill({ chain, size = 20 }: { chain: string; size?: number }) {
  return <ChainMark chain={chain} size={size} />;
}

function RobinhoodMark({ size }: { size: number }) {
  const icon = size * 0.62;
  return (
    <span
      aria-hidden
      className="flex size-full items-center justify-center rounded-full"
      style={{ background: "#ccff00" }}
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="#111">
        <path d="M20.0559.6412C19.5739.222 18.873.0255 17.786.0015c-.9876-.0218-2.16.1922-3.4893.6288-.1987.0699-.3582.1812-.4994.3188a64.271 64.271 0 0 0-3.9086 4.004l-.0959.1048a.0937.0937 0 0 0-.0113.107c.02.035.0619.0525.1011.0437l.1395-.0306c2.0022-.4279 4.0236-.7554 6.0084-.9715a.4605.4605 0 0 1 .3626.1179.4657.4657 0 0 1 .1499.3515c-.0323 1.9693.0392 3.9474.2144 5.8795l.0105.1267a.0927.0927 0 0 0 .0706.0808c.006.0022.013.0022.0218.0044a.1.1 0 0 0 .0784-.0394l.0715-.1025a55.8263 55.8263 0 0 1 3.614-4.6112c.1437-.1637.1812-.2664.2074-.4148.401-2.5719-.2206-4.4757-.7758-4.9582Zm-4.3967 5.528-.0026-.1222a.0945.0945 0 0 0-.061-.0852.0952.0952 0 0 0-.102.0263l-.081.0917c-3.3995 3.932-6.2577 8.2942-8.4927 12.9686l-.0523.109a.093.093 0 0 0 .0149.1049.095.095 0 0 0 .0653.0284.123.123 0 0 0 .0375-.0065l.1116-.0459c1.9098-.7903 3.8597-1.4759 5.7957-2.037a.4419.4419 0 0 0 .2693-.2227c.849-1.6549 2.8207-4.86 2.8207-4.86.0497-.072.0366-.179.0366-.179s-.3382-3.8316-.36-5.7704zM6.7317 17.341c.068-.131.3783-.7292.448-.8624l.013-.024c2.0781-3.919 4.6112-7.6174 7.526-10.9884l.081-.0939a.0974.0974 0 0 0 .0105-.1047.094.094 0 0 0-.0941-.048l-.122.0174A60.3806 60.3806 0 0 0 8.8367 6.322c-.19.0524-.312.1769-.3382.2052a64.6783 64.6783 0 0 0-4.02 5.3534c-.061.0939-.0829.2162-.0672.3166.013.0982.312 2.4016.7662 4.17-1.1262 3.2421-2.133 7.5148-2.133 7.5148a.0947.0947 0 0 0 .0131.0808.0888.0888 0 0 0 .0741.0371h.6416a.0987.0987 0 0 0 .0923-.0612l.0436-.12c.6546-1.786 1.4017-3.55 2.2271-5.2704.1918-.3974.5954-1.2074.5954-1.2074Zm3.8257 1.489-.1595.0525c-1.026.3405-2.5435.8667-3.906 1.4933-.0723.035-.1202.131-.1202.131-.0262.059-.0567.131-.0915.2117l-.0044.011c-.1534.3471-.3626.8689-.4541 1.0829l-.0698.1681a.067.067 0 0 0 .0175.0764.0615.0615 0 0 0 .0453.0197c.0087 0 .02-.0022.0305-.0065l.1639-.0786c.3739-.1769.8455-.4454 1.3388-.6812l.0175-.0087a885.5338 885.5338 0 0 0 2.6411-1.2554s.1029-.0546.1552-.1572l.4785-.9606a.0703.0703 0 0 0-.0087-.0765.0685.0685 0 0 0-.074-.0218z" />
      </svg>
    </span>
  );
}

function SolanaMark({ size }: { size: number }) {
  const gid = "solana-mark-gradient";
  const icon = size * 0.72;
  return (
    <span aria-hidden className="flex size-full items-center justify-center rounded-full bg-[#111]">
      <svg width={icon} height={icon} viewBox="0 0 24 24">
        <defs>
          <linearGradient id={gid} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#00FFA3" />
            <stop offset="100%" stopColor="#DC1FFF" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${gid})`}
          d="m23.8764 18.0313-3.962 4.1393a.9201.9201 0 0 1-.306.2106.9407.9407 0 0 1-.367.0742H.4599a.4689.4689 0 0 1-.2522-.0733.4513.4513 0 0 1-.1696-.1962.4375.4375 0 0 1-.0314-.2545.4438.4438 0 0 1 .117-.2298l3.9649-4.1393a.92.92 0 0 1 .3052-.2102.9407.9407 0 0 1 .3658-.0746H23.54a.4692.4692 0 0 1 .2523.0734.4531.4531 0 0 1 .1697.196.438.438 0 0 1 .0313.2547.4442.4442 0 0 1-.1169.2297zm-3.962-8.3355a.9202.9202 0 0 0-.306-.2106.941.941 0 0 0-.367-.0742H.4599a.4687.4687 0 0 0-.2522.0734.4513.4513 0 0 0-.1696.1961.4376.4376 0 0 0-.0314.2546.444.444 0 0 0 .117.2297l3.9649 4.1394a.9204.9204 0 0 0 .3052.2102c.1154.049.24.0744.3658.0746H23.54a.469.469 0 0 0 .2523-.0734.453.453 0 0 0 .1697-.1961.4382.4382 0 0 0 .0313-.2546.4444.4444 0 0 0-.1169-.2297zM.46 6.7225h18.7815a.9411.9411 0 0 0 .367-.0742.9202.9202 0 0 0 .306-.2106l3.962-4.1394a.4442.4442 0 0 0 .117-.2297.4378.4378 0 0 0-.0314-.2546.453.453 0 0 0-.1697-.196.469.469 0 0 0-.2523-.0734H4.7596a.941.941 0 0 0-.3658.0745.9203.9203 0 0 0-.3052.2102L.1246 5.9687a.4438.4438 0 0 0-.1169.2295.4375.4375 0 0 0 .0312.2544.4512.4512 0 0 0 .1692.196.4689.4689 0 0 0 .2518.0739z"
        />
      </svg>
    </span>
  );
}

function EthereumMark({ size }: { size: number }) {
  const icon = size * 0.56;
  return (
    <span
      aria-hidden
      className="flex size-full items-center justify-center rounded-full"
      style={{ background: "#627EEA" }}
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="#fff">
        <path d="M11.944 17.97 4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0 4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
      </svg>
    </span>
  );
}

function BaseMark({ size }: { size: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#0052FF" />
    </svg>
  );
}
