import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'var(--primary)', display: 'grid',
          placeItems: 'center', color: 'var(--primary-foreground)', fontWeight: 700
        }}>AC</div>
        <div>
          <h1 className="text-lg font-semibold">AutoCare</h1>
          <div className="text-xs text-muted-foreground">Quick booking & payments</div>
        </div>
      </div>
      <nav>
        <Link to="/" className="mr-4">Book</Link>
        <Link to="/calendar">Calendar</Link>
      </nav>
    </header>
  );
}
