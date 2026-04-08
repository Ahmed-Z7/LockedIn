import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { DMChatProvider } from "./components/DMChat";
import Home from "./pages/Home";
import DashboardPage from "./pages/DashboardPage";
import AICoachPage from "./pages/AICoachPage";
import FlashCardsPage from "./pages/FlashCardsPage";
import SchedulePage from "./pages/SchedulePage";
import BlockedWebsitesPage from "./pages/BlockedWebsitesPage";
import CoreBenefitsPage from "./pages/CoreBenefitsPage";
import AIFeaturesPage from "./pages/AIFeaturesPage";
import CommunityPage from "./pages/CommunityPage";
import ChatPage from "./pages/ChatPage";
import ChallengesPage from "./pages/ChallengesPage";
import ProfilePage from "./pages/ProfilePage";
import AddPostPage from "./pages/AddPostPage";
import NotificationsPage from "./pages/NotificationsPage";
import StartLearningPage from "./pages/StartLearningPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import StudySessionPage from "./pages/StudySessionPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import GamificationLevelsPage from "./pages/GamificationLevelsPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/ai-coach" component={AICoachPage} />
      <Route path="/flash-cards" component={FlashCardsPage} />
      <Route path="/schedule" component={SchedulePage} />
      <Route path="/focus-mode" component={BlockedWebsitesPage} />
      <Route path="/core-benefits" component={CoreBenefitsPage} />
      <Route path="/ai-features" component={AIFeaturesPage} />
      <Route path="/community" component={CommunityPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/challenges" component={ChallengesPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/profile/:id" component={ProfilePage} />
      <Route path="/messages" component={CommunityPage} />
      <Route path="/groups" component={CommunityPage} />
      <Route path="/groups/:id" component={CommunityPage} />
      <Route path="/add-post" component={AddPostPage} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route path="/start-learning" component={StartLearningPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/gamification-levels" component={GamificationLevelsPage} />
      <Route path="/study-session/:id" component={StudySessionPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider defaultTheme="dark" switchable>
          <TooltipProvider>
            <DMChatProvider>
              <Toaster />
              <Router />
            </DMChatProvider>
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
