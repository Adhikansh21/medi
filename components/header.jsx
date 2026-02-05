import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "./ui/badge";
import {
  Calendar,
  CreditCard,
  ShieldCheck,
  Stethoscope,
  User,
  MessageCircle,
} from "lucide-react";

import { checkUser } from "@/lib/checkUser";
import { checkAndAllocateCredits } from "@/actions/credits";
import AuthButtons from "./auth-buttons";

const Header = async () => {
  const user = await checkUser();

  if (user?.role === "PATIENT") {
    await checkAndAllocateCredits(user);
  }

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-10 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">

        <Link href="/">
          <Image
            src="/logo-single.png"
            alt="Medimeet Logo"
            width={200}
            height={60}
            className="h-10 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center space-x-2">

          {user?.role === "UNASSIGNED" && (
            <Link href="/onboarding">
              <Button variant="outline" className="hidden md:inline-flex gap-2">
                <User className="h-4 w-4" /> Complete Profile
              </Button>
            </Link>
          )}

          {user?.role === "ADMIN" && (
            <Link href="/admin">
              <Button variant="outline" className="hidden md:inline-flex gap-2">
                <ShieldCheck className="h-4 w-4" /> Admin Dashboard
              </Button>
            </Link>
          )}

          {user?.role === "DOCTOR" && (
            <Link href="/doctor">
              <Button variant="outline" className="hidden md:inline-flex gap-2">
                <Stethoscope className="h-4 w-4" /> Doctor Dashboard
              </Button>
            </Link>
          )}

          {user?.role === "PATIENT" && (
  <>
    <Link href="/appointments">
      <Button variant="outline" className="hidden md:inline-flex gap-2">
        <Calendar className="h-4 w-4" /> My Appointments
      </Button>
    </Link>

    <Link href="/assistant">
      <Button variant="outline" className="hidden md:inline-flex gap-2">
        <MessageCircle className="h-4 w-4" /> AI bot
      </Button>
    </Link>

    
  </>
)}


          {(!user || user?.role === "PATIENT") && (
            <Link href="/pricing">
              <Badge
                variant="outline"
                className="h-9 bg-emerald-900/20 border-emerald-700/30 px-3 py-1 flex items-center gap-2"
              >
                <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">
                  {user && user.role === "PATIENT" ? `${user.credits} Credits` : "Pricing"}
                </span>
              </Badge>
            </Link>
            
          )}

          {/* 👇 Client-only auth UI */}
          <AuthButtons />
        </div>
      </nav>
    </header>
  );
};

export default Header;
