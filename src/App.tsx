import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import InstallPrompt from "./components/InstallPrompt";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Lazy-load secondary pages for smaller initial bundle
const Pricing = lazy(() => import("./pages/Pricing"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const LoginScreen = lazy(() => import("./components/LoginScreen"));
const Blogmagica = lazy(() => import("./pages/blogmagica/BlogmagicaDashboard"));
const BlogmagicaArticles = lazy(() => import("./pages/blogmagica/BlogmagicaArticles"));
const BlogmagicaNew = lazy(() => import("./pages/blogmagica/BlogmagicaNew"));
const BlogmagicaSeo = lazy(() => import("./pages/blogmagica/BlogmagicaSeo"));
const BlogmagicaDrafts = lazy(() => import("./pages/blogmagica/BlogmagicaDrafts"));
const BlogmagicaPublished = lazy(() => import("./pages/blogmagica/BlogmagicaPublished"));
const BlogmagicaCalendar = lazy(() => import("./pages/blogmagica/BlogmagicaCalendar"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-black border-t-red-600 rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InstallPrompt />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth/login" element={<LoginScreen />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/blogmagica" element={<Blogmagica />} />
              <Route path="/blogmagica/articles" element={<BlogmagicaArticles />} />
              <Route path="/blogmagica/new" element={<BlogmagicaNew />} />
              <Route path="/blogmagica/seo" element={<BlogmagicaSeo />} />
              <Route path="/blogmagica/drafts" element={<BlogmagicaDrafts />} />
              <Route path="/blogmagica/published" element={<BlogmagicaPublished />} />
              <Route path="/blogmagica/calendar" element={<BlogmagicaCalendar />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
