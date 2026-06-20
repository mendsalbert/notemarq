import Image from 'next/image';

type NotemarqLogoProps = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  /** Override the wordmark color (defaults to brand blue). */
  wordmarkColor?: string;
};

export default function NotemarqLogo({
  size = 32,
  showWordmark = true,
  className = '',
  wordmarkColor,
}: NotemarqLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/logog.png"
        alt="Notemarq"
        width={size}
        height={size}
        className="rounded-[22%] shrink-0"
        priority
      />
      {showWordmark ? (
        <span
          className="font-bold text-base sm:text-lg tracking-wide"
          style={{ color: wordmarkColor ?? '#21348f' }}
        >
          NOTEMARQ
        </span>
      ) : null}
    </div>
  );
}
