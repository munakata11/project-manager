import { Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import Index from "../pages/Index";
import ProjectDetail from "../pages/ProjectDetail";

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Index />
          </Layout>
        }
      />
      <Route
        path="/project/:projectId"
        element={
          <Layout>
            <ProjectDetail />
          </Layout>
        }
      />
    </Routes>
  );
}