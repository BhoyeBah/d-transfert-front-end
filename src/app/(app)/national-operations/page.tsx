import type { Metadata } from "next";
import Link from "next/link";

import { listNationalOperations } from "@/lib/data/national-operations";
import { listWallets } from "@/lib/data/wallets";
import { formatDate, formatMoney } from "@/lib/format";
import { nationalOperationTypeLabels } from "@/lib/validation/national-operations";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateOperationDialog } from "./create-operation-dialog";
import { NationalOperationRowActions } from "./national-operation-row-actions";

export const metadata: Metadata = { title: "Opérations nationales — D-Transfert" };

export default async function NationalOperationsPage() {
  const [operations, wallets] = await Promise.all([listNationalOperations(), listWallets()]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Opérations nationales"
        description="Dépôts, retraits, échanges et rééquilibrages entre wallets — sans frais."
        action={<CreateOperationDialog wallets={wallets} />}
      />

      {operations.length === 0 ? (
        <EmptyState message="Aucune opération enregistrée." />
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Client (téléphone)</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((operation) => {
                const primaryLine = operation.lines.find(
                  (line) => Number(line.amount_in) > 0 || Number(line.amount_out) > 0
                );
                const primaryAmount = primaryLine
                  ? Number(primaryLine.amount_in) > 0
                    ? primaryLine.amount_in
                    : primaryLine.amount_out
                  : null;

                return (
                  <TableRow key={operation.id}>
                    <TableCell className="font-mono text-xs">
                      <Link href={`/national-operations/${operation.id}`} className="hover:underline">
                        {operation.reference}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {nationalOperationTypeLabels[operation.type as keyof typeof nationalOperationTypeLabels] ??
                        operation.type}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={operation.status} />
                    </TableCell>
                    <TableCell className="text-sm">
                      {operation.client_name
                        ? `${operation.client_name}${operation.client_phone ? ` (${operation.client_phone})` : ""}`
                        : operation.client_phone ?? "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {primaryLine ? formatMoney(primaryAmount ?? "0", primaryLine.currency) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(operation.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <NationalOperationRowActions
                        operationId={operation.id}
                        canCancel={operation.status === "validated"}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
