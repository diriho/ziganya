import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button, Card, EmptyState } from "@/components/ui";

export function PageError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card padding="none">
      <EmptyState
        tone="danger"
        icon={<AlertTriangle size={22} />}
        title="Something went wrong"
        description={message}
        action={
          onRetry && (
            <Button variant="secondary" onClick={onRetry} leftIcon={<RefreshCw size={16} />}>
              Try again
            </Button>
          )
        }
      />
    </Card>
  );
}
