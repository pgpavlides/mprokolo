import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LibPage() {
  return (
    <div className="min-h-screen bg-black text-green-400">
      <div className="container mx-auto px-4">
        <div className="py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Menu</span>
          </Link>
        </div>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-green-500 text-xl">Coming Soon</div>
        </div>
      </div>
    </div>
  );
}