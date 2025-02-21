import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="absolute -inset-1 bg-green-500 rounded-lg blur opacity-25"></div>
        <div className="relative flex items-center justify-center w-24 h-24 border-2 border-green-500 rounded-lg bg-black">
          <Image 
            src="/brocoli_outlines_green.svg"
            alt="MPROKOLO Logo"
            width={64}
            height={64}
            className="w-16 h-16 text-green-500"
            priority
          />
        </div>
      </div>
      <span className="text-xl font-bold tracking-wider text-green-400">MPROKOLO</span>
    </div>
  );
}