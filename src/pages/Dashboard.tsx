import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Navigate } from "react-router";
import { Sidebar } from "@/components/Sidebar";
import { DashboardContent } from "@/components/DashboardContent";
import { useState } from "react";

export default function Dashboard() {
  const { isLoading, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background flex"
    >
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-hidden">
        <DashboardContent activeSection={activeSection} />
      </main>
    </motion.div>
  );
}
