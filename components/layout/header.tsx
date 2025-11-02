"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell } from "lucide-react";
import { MobileSidebar } from "./mobile-sidebar";

interface HeaderProps {
  events: Array<{ id: string; name: string }>;
}

export function Header({ events }: HeaderProps) {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Mobile menu button */}
        <MobileSidebar events={events} />

        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl">ETHCR Planner</span>
        </Link>

        {/* Desktop Navigation - will be hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Panel
          </Link>
          <Link
            href="/events"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Eventos
          </Link>
          <Link
            href="/tracks"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Tracks
          </Link>
          <Link
            href="/tasks"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Tareas
          </Link>
          <Link
            href="/meetings"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Reuniones
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="ml-auto flex items-center space-x-2">
          {/* Search */}
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
            <span className="sr-only">Buscar</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificaciones</span>
          </Button>

          {/* User profile */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt="Usuario" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="sr-only">Menú de usuario</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

