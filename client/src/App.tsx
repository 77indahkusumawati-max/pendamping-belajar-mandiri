// Signal & Focus: aplikasi belajar dengan alur login → ringkasan → materi/kuis.
import { Toaster } from "@/components/ui/sonner";
import type { ReactNode } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Materials from "./pages/Materials";
import Quiz from "./pages/Quiz";
import Progress from "./pages/Progress";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#f6f1e8] text-sm text-[#65716a]">Memuat ruang belajar...</div>;
  return user ? <>{children}</> : <Login />;
}

function AuthHome() {
  return <RequireAuth><Home /></RequireAuth>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/materi/:subject" component={() => <RequireAuth><Materials /></RequireAuth>} />
      <Route path="/kuis" component={() => <RequireAuth><Quiz /></RequireAuth>} />
      <Route path="/progres" component={() => <RequireAuth><Progress /></RequireAuth>} />
      <Route path="/leaderboard" component={() => <RequireAuth><Leaderboard /></RequireAuth>} />
      <Route path="/profil" component={() => <RequireAuth><Profile /></RequireAuth>} />
      <Route path="/" component={AuthHome} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
