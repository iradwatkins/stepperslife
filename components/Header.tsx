"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import logo from "@/images/logo.png";
import SearchBar from "./SearchBar";
import { User, LogOut, Ticket, Store } from "lucide-react";

function Header() {
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="border-b">
      <div className="flex flex-col lg:flex-row items-center gap-4 p-4">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <Link href="/" className="font-bold shrink-0">
            <Image
              src={logo}
              alt="logo"
              width={100}
              height={100}
              className="w-24 lg:w-28"
            />
          </Link>

          <div className="lg:hidden">
            {status === "authenticated" && session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{session.user.email?.split('@')[0]}</span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <Link href="/tickets" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      My Tickets
                    </Link>
                    <Link href="/seller" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Seller Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/signin">
                <button className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar - Full width on mobile */}
        <div className="w-full lg:max-w-2xl">
          <SearchBar />
        </div>

        <div className="hidden lg:block ml-auto">
          {status === "authenticated" && session?.user ? (
            <div className="flex items-center gap-3">
              <Link href="/seller">
                <button className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-700 transition">
                  Sell Tickets
                </button>
              </Link>

              <Link href="/tickets">
                <button className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300">
                  My Tickets
                </button>
              </Link>
              
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{session.user.email?.split('@')[0]}</span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <Link href="/tickets" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      <Ticket className="w-4 h-4 inline mr-2" />
                      My Tickets
                    </Link>
                    <Link href="/seller" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      <Store className="w-4 h-4 inline mr-2" />
                      Seller Dashboard
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link href="/auth/signin">
              <button className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300">
                Sign In
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Action Buttons */}
        <div className="lg:hidden w-full flex justify-center gap-3">
          {status === "authenticated" && session?.user && (
            <>
              <Link href="/seller" className="flex-1">
                <button className="w-full bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-700 transition">
                  Sell Tickets
                </button>
              </Link>

              <Link href="/tickets" className="flex-1">
                <button className="w-full bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-200 transition border border-gray-300">
                  My Tickets
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
