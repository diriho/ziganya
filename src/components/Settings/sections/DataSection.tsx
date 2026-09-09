import { useState } from "react";
import { Download } from "lucide-react";
import { useAuth } from "@sdk/auth";
import { fetchAllTransactions, useCategories, useSubscriptions, useTransactions } from "@sdk/requests";
import { Button, useToast } from "@/components/ui";
import { downloadTextFile, todayStamp, transactionsToCsv } from "@/lib/csv";
import { SettingsSection } from "../SettingsSection";

export function DataSection() {
  const { user } = useAuth();
  const userId = user?.userID ?? "";
  const { data: transactions = [] } = useTransactions(userId, 5000);
  const { data: subscriptions = [] } = useSubscriptions(userId, 500);
  const { data: categories = [] } = useCategories(userId);
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const exportCsv = async () => {
    setBusy(true);
    try {
      const all = await fetchAllTransactions(userId);
      downloadTextFile(`ziganya-transactions-${todayStamp()}.csv`, transactionsToCsv(all, new Map(categories.map((c) => [c.id, c.name]))));
      toast.success("Export ready", `${all.length} transactions saved as CSV.`);
    } catch (err) {
      toast.error("Export failed", err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SettingsSection id="data" title="Your data" description="Everything you've recorded, ready to take with you.">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs font-medium text-muted">Transactions</dt>
            <dd className="tabular mt-0.5 text-lg font-bold">{transactions.length}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted">Subscriptions</dt>
            <dd className="tabular mt-0.5 text-lg font-bold">{subscriptions.length}</dd>
          </div>
        </dl>
        <Button variant="secondary" leftIcon={<Download size={16} />} onClick={exportCsv} loading={busy} disabled={transactions.length === 0}>
          Export transactions (CSV)
        </Button>
      </div>
    </SettingsSection>
  );
}
