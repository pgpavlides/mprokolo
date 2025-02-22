import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="absolute -inset-1 bg-green-500 rounded-lg blur opacity-25"></div>
        <div className="relative flex items-center justify-center w-52 h-52 border-2 border-green-500 rounded-lg bg-black">
          <Image 
            src="/brocoli_outlines_green.svg"
            alt="MPROKOLO Logo"
            width={100}
            height={100}
            className="w-40 h-40 text-green-500"
            priority
          />
        </div>
      </div>
      <span className="text-5xl font-bold tracking-wider text-green-400 mt-10">Broccoli Github Creator</span>
    </div>
  );
}