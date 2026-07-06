import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ApiError, UnauthenticatedError } from "@/lib/api-error";
import { getCompanyMe } from "@/lib/data/company";
import { listWallets } from "@/lib/data/wallets";
import { formatMoney } from "@/lib/format";
import { walletTypeLabels } from "@/lib/validation/wallets";
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
import { CreateWalletDialog } from "./create-wallet-dialog";

export const metadata: Metadata = { title: "Wallets — D-Transfert" };

export default async function WalletsPage() {
  let wallets;
  let company;

  try {
    [wallets, company] = await Promise.all([listWallets(), getCompanyMe()]);
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      redirect("/login");
    }
    if (error instanceof ApiError && error.status === 403) {
      return (
        <div className="flex flex-col gap-6">
          <PageHeader
            title="Wallets"
            description="Comptes de trésorerie de votre entreprise."
          />
          <EmptyState message="Accès refusé: votre compte n'a pas la permission de consulter les wallets." />
        </div>
      );
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Wallets"
        description="Comptes de trésorerie de votre entreprise."
        action={<CreateWalletDialog defaultCurrency={company.default_currency} />}
      />

      {wallets.length === 0 ? (
        <EmptyState message="Aucun wallet créé pour le moment." />
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Solde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.map((wallet) => (
                <TableRow key={wallet.id}>
                  <TableCell className="font-medium">
                    <Link href={`/wallets/${wallet.id}`} className="hover:underline">
                      {wallet.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{wallet.code}</TableCell>
                  <TableCell>{walletTypeLabels[wallet.type]}</TableCell>
                  <TableCell>
                    <StatusBadge status={wallet.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatMoney(wallet.balance, wallet.currency)}
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
