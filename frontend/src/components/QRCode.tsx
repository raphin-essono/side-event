type Props = { value: string; size?: number };

export function QRCode({ value, size = 280 }: Props) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(value)}`;
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-border">
      <img src={src} width={size} height={size} alt="QR de connexion" className="block" />
    </div>
  );
}
