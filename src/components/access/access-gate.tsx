"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  LockKeyhole,
  Shield,
  Sparkles,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";

import { getCentreById, getHarasById } from "@/data/haras";
import { defaultRole } from "@/data/roles";
import { buildDashboardPath } from "@/lib/navigation";
import { useAdminProvider } from "@/components/providers/admin-provider";
import { useSession } from "@/components/providers/session-provider";
import { AccessScope } from "@/types/domain";

import { SorecLogo } from "@/components/branding/sorec-logo";
import { RoleBadge } from "@/components/role-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AccessGate = ({
  harasId,
  scope,
  centreId,
}: {
  harasId: string;
  scope: AccessScope;
  centreId?: string;
}) => {
  const router = useRouter();
  const { authenticate, session } = useSession();
  const { getUsersForScope } = useAdminProvider();

  const [password, setPassword] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const haras = getHarasById(harasId);
  const centre = centreId ? getCentreById(centreId) : undefined;

  const authorizedUsers = useMemo(
    () => getUsersForScope(harasId, scope === "centre" ? centreId : undefined),
    [centreId, getUsersForScope, harasId, scope],
  );

  useEffect(() => {
    if (authorizedUsers.length === 0) {
      setSelectedUserId("");
      return;
    }

    if (!authorizedUsers.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(authorizedUsers[0].id);
    }
  }, [authorizedUsers, selectedUserId]);

  useEffect(() => {
    setPassword("");
  }, [selectedUserId]);

  const selectedUser = authorizedUsers.find((user) => user.id === selectedUserId);
  const selectedRole = selectedUser?.role ?? defaultRole;

  const alreadyAuthorized =
    session.status === "granted" &&
    session.harasId === harasId &&
    (scope === "haras" ||
      session.scope === "haras" ||
      session.centreId === centreId);

  if (!haras) {
    return (
      <Card>
        <CardContent className="p-8">
          <p>Haras introuvable.</p>
        </CardContent>
      </Card>
    );
  }

  const targetPath = buildDashboardPath(harasId, scope, centreId);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedUser) {
      setFeedback({
        type: "error",
        message:
          "Aucun utilisateur actif n'est autorise sur ce perimetre. Creez-en un dans /admin.",
      });
      return;
    }

    const result = await authenticate({
      harasId,
      scope,
      centreId,
      password,
      role: selectedRole,
      userId: selectedUser.id,
    });

    if (!result.success) {
      setFeedback({ type: "error", message: result.message });
      toast.error("Acces refuse", { description: result.message });
      return;
    }

    setFeedback({ type: "success", message: result.message });
    toast.success("Acces valide", { description: result.message });
    window.setTimeout(() => {
      router.replace(targetPath);
    }, 500);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="relative overflow-hidden border-white/80 bg-white/80">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${haras.palette.from} ${haras.palette.via} ${haras.palette.to} opacity-[0.97]`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_35%)]" />
        <CardContent className="relative flex h-full flex-col justify-between p-8 text-white">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <SorecLogo tone="light" size="sm" />
              <Badge className="border-white/20 bg-white/10 text-white">
                Acces protege
              </Badge>
            </div>

            <div className="space-y-4">
              <p className="section-caption text-white/70">Mode d'emploi</p>
              <h1 className="text-4xl font-semibold leading-tight text-white lg:text-5xl">
                {scope === "haras" ? haras.name : centre?.name}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/75 lg:text-base">
                L'entree a ete simplifiee: choisissez votre nom, saisissez votre
                mot de passe, puis ouvrez directement l'espace
                correspondant.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: UserCog,
                  title: "1. Votre profil",
                  text: "Choisissez votre nom dans la liste.",
                },
                {
                  icon: LockKeyhole,
                  title: "2. Le mot de passe",
                  text: "Saisissez le mot de passe de votre profil.",
                },
                {
                  icon: Shield,
                  title: "3. Validation",
                  text: "Ouvrez votre espace si les identifiants sont corrects.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-white/20 bg-white/10 p-5"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <p className="text-sm font-semibold">{item.title}</p>
                    </div>
                    <p className="mt-3 text-sm text-white/75">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {alreadyAuthorized ? (
              <Button asChild variant="secondary">
                <Link href={targetPath}>Entrer directement</Link>
              </Button>
            ) : null}
            <Button
              asChild
              variant="outline"
              className="border-white/25 bg-white/10 text-white hover:bg-white/15"
            >
              <Link href={`/haras/${harasId}`}>Retour au haras</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/80 bg-white/90">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-3xl">Entrer dans l'espace</CardTitle>
              <CardDescription className="mt-2">
                Selectionnez votre profil puis saisissez votre mot de passe.
              </CardDescription>
            </div>
            <RoleBadge role={selectedRole} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="managed-user">Votre nom</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="managed-user">
                  <SelectValue placeholder="Selectionner votre profil" />
                </SelectTrigger>
                <SelectContent>
                  {authorizedUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUser ? (
                <div className="rounded-[1.25rem] border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{selectedUser.fullName}</p>
                      <p className="mt-1">{selectedUser.email}</p>
                    </div>
                    <RoleBadge role={selectedUser.role} />
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Aucun profil actif sur ce perimetre. Creez-le dans{" "}
                  <Link href="/admin" className="font-semibold underline">
                    /admin
                  </Link>
                  .
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="managed-password">Mot de passe utilisateur</Label>
              <Input
                id="managed-password"
                type="password"
                value={password}
                disabled={!selectedUser}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Saisir le mot de passe"
                autoComplete="current-password"
              />
            </div>

            {feedback ? (
              <div
                className={`rounded-[1.25rem] border px-4 py-3 text-sm ${
                  feedback.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4" />
                  ) : (
                    <LockKeyhole className="mt-0.5 h-4 w-4" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              disabled={session.status === "pending" || !selectedUser}
            >
              {session.status === "pending" ? "Validation..." : "Ouvrir mon espace"}
            </Button>
          </form>

          <div className="rounded-[1.5rem] border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-slate-950">Ce que change votre role</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Selon votre profil, certains boutons de modification ou d'export peuvent
              apparaitre ou rester masques.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
