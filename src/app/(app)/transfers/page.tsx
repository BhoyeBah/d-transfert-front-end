import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftRight, Clock, HandCoins, Wallet } from "lucide-react";

import { listCollaborations } from "@/lib/data/collaborations";
import { listEntries } from "@/lib/data/entries";
import { listTransfers } from "@/lib/data/transfers";
import { formatDate, formatMoney } from "@/lib/format";
import { sendModeLabels } from "@/lib/validation/transfers";
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
import { CreateTransferDialog } from "./create-transfer-dialog";

export const metadata: Metadata = { title: "Envois internationaux — D-Transfert" };

export default async function TransfersPage({
  searchParams,
}: {
  searchParams: Promise<{ entry?: string }>;
}) {
  const params = await searchParams;
  const [transfers, collaborations, entries] = await Promise.all([
    listTransfers(),
    listCollaborations(),
    listEntries(),
  ]);
  const entryReferenceById = new Map(entries.map((entry) => [entry.id, entry.reference]));
  const acceptedCollaborations = collaborations.filter((c) => c.status === "accepted");
  const initialEntryId = params.entry ?? null;
  const pendingCount = transfers.filter((transfer) => transfer.status === "pending").length;
  const withEntryCount = transfers.filter((transfer) => transfer.entry_id !== null).length;
  const clientDebtCount = transfers.filter((transfer) => transfer.client_debt_amount !== null).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Envois internationaux"
        description="Transferts vers un collaborateur, avec ou sans entrée associée."
        action={
          <CreateTransferDialog
            collaborations={acceptedCollaborations}
            entries={entries}
            initialEntryId={initialEntryId}
            initialOpen={Boolean(initialEntryId)}
          />
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Envois total" value={transfers.length} icon={ArrowLeftRight} />
        <StatTile
          label="En attente"
          value={pendingCount}
          icon={Clock}
          tone={pendingCount > 0 ? "warning" : "default"}
        />
        <StatTile
          label="Avec entrée"
          value={withEntryCount}
          icon={Wallet}
          hint="Source liée"
        />
        <StatTile
          label="Dette client"
          value={clientDebtCount}
          icon={HandCoins}
          tone={clientDebtCount > 0 ? "warning" : "success"}
        />
      </section>

      {transfers.length === 0 ? (
        <EmptyState message="Aucun envoi enregistré." />
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Bénéficiaire</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell className="font-mono text-xs">
                    <Link href={`/transfers/${transfer.id}`} className="hover:underline">
                      {transfer.reference}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {transfer.entry_id ? (
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit">
                          Via entrée
                        </Badge>
                        <Link href={`/entries/${transfer.entry_id}`} className="font-medium text-foreground hover:underline">
                          {entryReferenceById.get(transfer.entry_id) ?? transfer.entry_id.slice(0, 8)}
                        </Link>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="w-fit">
                        Direct
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {transfer.beneficiary_name ?? transfer.beneficiary_phone}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {sendModeLabels[transfer.send_mode]}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={transfer.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(transfer.amount, transfer.currency)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(transfer.created_at)}
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
