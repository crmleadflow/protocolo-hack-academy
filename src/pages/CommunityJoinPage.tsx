import React from "react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { JoinCommunityForm } from "@/components/community/JoinCommunityForm";

// Lo que ve quien toca "Comunidad" sin tener cuenta: captura sus datos y lo mete al chat.
const CommunityJoinPage: React.FC = () => (
  <PublicLayout>
    <section className="mx-auto max-w-xl px-5 py-16">
      <h1 className="text-4xl font-bold">
        Únete a la <span className="serif-accent text-primary">comunidad</span>
      </h1>
      <p className="mt-3 mb-8 text-muted-foreground">
        Comparte avances, resuelve dudas y conecta con otros emprendedores. Déjanos tus datos y entras directo al chat.
      </p>
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <JoinCommunityForm />
      </div>
    </section>
  </PublicLayout>
);

export default CommunityJoinPage;
