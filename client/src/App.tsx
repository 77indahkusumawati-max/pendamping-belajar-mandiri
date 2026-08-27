// Signal & Focus: aplikasi belajar dengan alur login → ringkasan → materi/kuis.
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Materials from "./pages/Materials";
import Quiz from "./pages/Quiz";

function Router() {
  const loggedIn = Boolean(localStorage.getItem("temanbelajar_user"));
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/materi/:subject" component={Materials} />
      <Route path="/kuis" component={Quiz} />
      <Route path="/" component={() => loggedIn ? <Home /> : <Redirect to="/login" />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
