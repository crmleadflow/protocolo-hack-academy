import React from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CommunityPage from "@/pages/CommunityPage";
import CommunityJoinPage from "@/pages/CommunityJoinPage";

// Con cuenta: la comunidad. Sin cuenta: el formulario para unirse (en vez de mandarlo al login).
export const CommunityRoute: React.FC = () => {
  const { user, session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return user && session ? <CommunityPage /> : <CommunityJoinPage />;
};
