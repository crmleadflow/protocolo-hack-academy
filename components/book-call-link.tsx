import { Button } from "@/components/ui/button";

// El endpoint público de agenda del CRM (POST /api/calendario/agendar) ya
// crea el lead solo con que alguien reserve desde ese link — por eso acá no
// hace falta pasar por intent_events/crm_outbox para este caso particular.
export function BookCallLink() {
  const url = process.env.LEADFLOW_CRM_BOOKING_URL;
  if (!url) return null;

  return (
    <a href={url} target="_blank" rel="noreferrer">
      <Button size="lg" variant="secondary">
        Agendar una llamada
      </Button>
    </a>
  );
}
