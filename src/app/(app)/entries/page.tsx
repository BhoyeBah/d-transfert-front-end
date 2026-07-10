import type { Metadata } from "next";
import { HandCoins, ScrollText, Users } from "lucide-react";

import { listEntries } from "@/lib/data/entries";
import { listWallets } from "@/lib/data/wallets";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { StatTile } from "@/components/stat-tile";
import { CreateEntryDialog } from "./create-entry-dialog";
import { EntriesTable } from "./entries-table";

export const metadata: Metadata = { title: "Entrées — D-Transfert" };

export default async function EntriesPage() {
  const [entries, wallets] = await Promise.all([listEntries(), listWallets()]);
  const mergeableEntriesCount = entries.filter(
    (entry) => entry.status === "unallocated" || entry.status === "partially_allocated"
  ).length;
  const entriesWithClientCount = entries.filter((entry) => entry.client_name && entry.client_phone).length;
  const consumedEntriesCount = entries.filter((entry) => entry.status === "consumed").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Entrées"
        description="Argent reçu des clients, à transformer en envoi ou en paiement client."
        action={<CreateEntryDialog wallets={wallets} />}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Entrées total" value={entries.length} icon={ScrollText} />
        <StatTile
          label="À fusionner"
          value={mergeableEntriesCount}
          icon={Users}
          hint="Disponibles ou partiellement affectées"
        />
        <StatTile
          label="Avec client"
          value={entriesWithClientCount}
          icon={HandCoins}
          hint="Nom et téléphone renseignés"
        />
        <StatTile label="Consommées" value={consumedEntriesCount} tone="success" />
      </section>

      {entries.length === 0 ? (
        <EmptyState message="Aucune entrée enregistrée." />
      ) : (
        <Card className="py-4">
          <EntriesTable entries={entries} />
        </Card>
      )}
    </div>
  );
}
