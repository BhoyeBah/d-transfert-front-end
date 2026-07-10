import type { Metadata } from "next";
import Link from "next/link";
import { Clock, HandCoins, Wallet } from "lucide-react";

import { listCollaborations } from "@/lib/data/collaborations";
import { listClients } from "@/lib/data/clients";
import { listEntries } from "@/lib/data/entries";
import { listPayments } from "@/lib/data/payments";
import { listWallets } from "@/lib/data/wallets";
import { formatDate, formatMoney } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatTile } from "@/components/stat-tile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreatePaymentDialog } from "./create-payment-dialog";

export const metadata: Metadata = { title: "Paiements client — D-Transfert" };

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ entry?: string }>;
}) {
  const params = await searchParams;
  const [payments, collaborations, clients, entries, wallets] = await Promise.all([
    listPayments(),
    listCollaborations(),
    listClients(),
    listEntries(),
    listWallets(),
  ]);
  const clientById = new Map(clients.map((client) => [client.id, client]));
  const entryReferenceById = new Map(entries.map((entry) => [entry.id, entry.reference]));
  const walletNameById = new Map(wallets.map((wallet) => [wallet.id, wallet.name]));
  const acceptedCollaborations = collaborations.filter((c) => c.status === "accepted");
  const initialEntryId = params.entry ?? null;
  const pendingCount = payments.filter((payment) => payment.status === "pending").length;
  const withEntryCount = payments.filter((payment) => payment.entry_id !== null).length;
  const directCount = payments.filter((payment) => payment.wallet_id !== null).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Paiements client"
        description="Règlement d'une dette client, via une entrée ou un wallet."
        action={
          <CreatePaymentDialog
            collaborations={acceptedCollaborations}
            entries={entries}
            wallets={wallets}
            initialEntryId={initialEntryId}
            initialOpen={Boolean(initialEntryId)}
          />
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Paiements total" value={payments.length} icon={HandCoins} />
        <StatTile
          label="En attente"
          value={pendingCount}
          icon={Clock}
          tone={pendingCount > 0 ? "warning" : "default"}
        />
        <StatTile label="Via entrée" value={withEntryCount} icon={Wallet} hint="Entrée associée" />
        <StatTile label="Directs" value={directCount} icon={Wallet} hint="Paiement hors entrée" />
      </section>

      {payments.length === 0 ? (
        <EmptyState message="Aucun paiement enregistré." />
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-xs">
                    <Link href={`/payments/${payment.id}`} className="hover:underline">
                      {payment.reference}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {payment.entry_id ? (
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit">
                          Via entrée
                        </Badge>
                        <Link href={`/entries/${payment.entry_id}`} className="font-medium text-foreground hover:underline">
                          {entryReferenceById.get(payment.entry_id) ?? payment.entry_id.slice(0, 8)}
                        </Link>
                      </div>
                    ) : payment.wallet_id ? (
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary" className="w-fit">
                          Wallet
                        </Badge>
                        <Link href={`/wallets/${payment.wallet_id}`} className="font-medium text-foreground hover:underline">
                          {walletNameById.get(payment.wallet_id) ?? payment.wallet_id.slice(0, 8)}
                        </Link>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="w-fit">
                        Direct
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {payment.client_id
                      ? clientById.get(payment.client_id)?.name ?? payment.client_name ?? "—"
                      : payment.client_name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(payment.amount, payment.currency)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(payment.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
