import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import { ThemeProvider } from "./components/ThemeToggle";
import { FavoritesProvider } from "./lib/favorites";
import { FiltersProvider } from "./lib/filters";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import GlobalBranches from "./pages/GlobalBranches";
import BranchDetail from "./pages/BranchDetail";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Courses from "./pages/Courses";
import Assessments from "./pages/Assessments";
import Content from "./pages/Content";
import Evaluations from "./pages/Evaluations";
import EvaluationDetail from "./pages/EvaluationDetail";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <ThemeProvider>
    <FavoritesProvider>
    <FiltersProvider>
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="branches" element={<GlobalBranches />} />
          <Route path="branches/:id" element={<BranchDetail />} />
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="courses" element={<Courses />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="content" element={<Content />} />
          <Route path="evaluations" element={<Evaluations />} />
          <Route path="evaluations/:branchId" element={<EvaluationDetail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ToastProvider>
    </FiltersProvider>
    </FavoritesProvider>
    </ThemeProvider>
  );
}
