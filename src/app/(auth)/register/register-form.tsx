"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { registerAction } from "@/actions/auth";
import { initialActionState } from "@/lib/action-state";
import { CurrencySelect } from "@/components/currency-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm({ supportedCurrencies }: { supportedCurrencies: string[] }) {
  const [state, setState] = useState(initialActionState);
  const [isPending, startTransition] = useTransition();
  const [currency, setCurrency] = useState<string>(supportedCurrencies[0] ?? "XOF");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Volontairement pas de `<form action={...}>` (Server Action native) : React réinitialise
    // les champs non contrôlés une fois l'action résolue, même en cas d'erreur — l'utilisateur
    // devrait alors tout retaper. En passant par onSubmit + startTransition, les champs déjà
    // saisis restent affichés le temps de corriger uniquement le champ en erreur.
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await registerAction(state, formData);
      setState(result);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-semibold tracking-tight">Inscrire votre entreprise</h1>
        <p className="text-sm text-muted-foreground">
          Un matricule d&apos;entreprise vous sera attribué, il servira à votre connexion et à vos
          collaborations.
        </p>
      </div>

      {state.status === "error" && state.message && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="company_name">Nom de l&apos;entreprise</Label>
        <Input id="company_name" name="company_name" required />
        {state.fieldErrors?.company_name && (
          <p className="text-sm text-destructive">{state.fieldErrors.company_name[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="company_phone">Téléphone entreprise</Label>
          <Input id="company_phone" name="company_phone" placeholder="+224..." required />
          {state.fieldErrors?.company_phone && (
            <p className="text-sm text-destructive">{state.fieldErrors.company_phone[0]}</p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="default_currency">Devise par défaut</Label>
          <CurrencySelect
            id="default_currency"
            name="default_currency"
            value={currency}
            onValueChange={setCurrency}
            currencies={supportedCurrencies}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="address">Adresse de l&apos;entreprise</Label>
        <Input id="address" name="address" required />
        {state.fieldErrors?.address && (
          <p className="text-sm text-destructive">{state.fieldErrors.address[0]}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="owner_full_name">Votre nom complet (Owner)</Label>
        <Input id="owner_full_name" name="owner_full_name" required />
        {state.fieldErrors?.owner_full_name && (
          <p className="text-sm text-destructive">{state.fieldErrors.owner_full_name[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
          {state.fieldErrors?.password && (
            <p className="text-sm text-destructive">{state.fieldErrors.password[0]}</p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password_confirmation">Confirmation</Label>
          <Input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            required
          />
          {state.fieldErrors?.password_confirmation && (
            <p className="text-sm text-destructive">{state.fieldErrors.password_confirmation[0]}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Création..." : "Créer l'entreprise"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
