import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full mt-12 p-8 bg-gray-200/50 backdrop-blur-sm rounded-t-3xl border-t border-gray-300 text-gray-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <div className="text-center md:text-left">
          <p className="text-lg font-bold text-blue-600">HeartFund</p>
          <p className="text-sm">Built with Next.js, Ethers, and Firebase.</p>
        </div>
        <div className="flex space-x-6 text-sm">
          <Link href="/about" className="hover:text-blue-500 transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-blue-500 transition-colors">
            Contact
          </Link>
          <a href="#" className="hover:text-blue-500 transition-colors">
            Terms
          </a>
        </div>
        <p className="text-sm text-center md:text-right">
          © {new Date().getFullYear()} HeartFund.
        </p>
      </div>
    </footer>
  );
}