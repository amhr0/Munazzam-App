import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Meetings from "./pages/Meetings";
import MeetingDetail from "./pages/MeetingDetail";
import Interviews from "./pages/Interviews";
import Tasks from "./pages/Tasks";
import DailyBriefing from "./pages/DailyBriefing";
import Integrations from "./pages/Integrations";
import Calendar from "./pages/Calendar";
import EmailInbox from "@/pages/EmailInbox";
import LiveInterview from "@/pages/LiveInterview";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password"} component={ResetPassword} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/meetings"} component={Meetings} />
      <Route path={"/meetings/:id"} component={MeetingDetail} />
      <Route path={"/interviews"} component={Interviews} />
      <Route path={"/tasks"} component={Tasks} />
      <Route path={"/briefing"} component={DailyBriefing} />
      <Route path={"/integrations"} component={Integrations} />
      <Route path={"/calendar"} component={Calendar} />
      <Route path={"/email-inbox"} component={EmailInbox} />
      <Route path={"/live-interview"} component={LiveInterview} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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

export default App;
