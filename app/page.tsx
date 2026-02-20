'use client'
import LandingPage from "./components/LandingPage"


export default function Home() {
  return (
    <main className="relative min-h-screen bg-gray-100">
        <div className="relative z-10">
          <LandingPage />
      </div>
    </main>
  );
}