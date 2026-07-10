import type { Metadata } from "next";
import { Clock, Link2, Users } from "lucide-react";

import { getCompanyMe } from "@/lib/data/company";
import { listCollaborations } from "@/lib/data/collaborations";
import { getMe } from "@/lib/data/me";
import { formatDate } from "@/lib/format";
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
import { RequestCollaborationDialog } from "./request-collaboration-dialog";
import { CollaborationRowActions } from "./collaboration-row-actions";

export const metadata: Metadata = { title: "Collaborations — D-Transfert" };

export default async function CollaborationsPage() {
  const [collaborations, company, me] = await Promise.all([
    listCollaborations(),
    getCompanyMe(),
    getMe(),
  ]);
  const acceptedCount = collaborations.filter((collaboration) => collaboration.status === "accepted").length;
  const pendingCount = collaborations.filter((collaboration) => collaboration.status === "pending").length;
  const withRateCount = collaborations.filter((collaboration) => collaboration.current_rate !== null).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Collaborations"
        description="Entreprises partenaires pour les envois internationaux."
        action={<RequestCollaborationDialog defaultCurrency={company.default_currency} />}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Collaborations" value={collaborations.length} icon={Users} />
        <StatTile
          label="Acceptées"
          value={acceptedCount}
          icon={Link2}
          tone={acceptedCount > 0 ? "success" : "default"}
        />
        <StatTile
          label="En attente"
          value={pendingCount}
          icon={Clock}
          tone={pendingCount > 0 ? "warning" : "default"}
        />
        <StatTile label="Avec taux" value={withRateCount} icon={Link2} hint="Taux collaboratif actif" />
      </section>

      {collaborations.length === 0 ? (
        <EmptyState message="Aucune collaboration pour le moment." />
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partenaire</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Devise</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Taux actuel</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborations.map((collaboration) => (
                <TableRow key={collaboration.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{collaboration.counterparty_company_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {collaboration.counterparty_company_matricule}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={collaboration.initiator_company_id === me.company_id ? "default" : "outline"}>
                      {collaboration.initiator_company_id === me.company_id ? "Initiateur" : "Sollicité"}
                    </Badge>
                  </TableCell>
                  <TableCell>{collaboration.currency}</TableCell>
                  <TableCell>
                    <StatusBadge status={collaboration.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {collaboration.current_rate ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(collaboration.created_at)}
                  </TableCell>
                  <TableCell>
                    <CollaborationRowActions
                      collaboration={collaboration}
                      isTarget={collaboration.target_company_id === me.company_id}
                    />
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
