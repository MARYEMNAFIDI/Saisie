"use client";

import Link from "next/link";
import { LockKeyhole, ShieldAlert } from "lucide-react";

import { buildAccessPath } from "@/lib/navigation";
import { useMockDatabase } from "@/components/providers/mock-db-provider";
import { useSession } from "@/components/providers/session-provider";
import { Permission } from "@/types/domain";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProtectedPage = ({
  harasId,
  centreId,
  permission,
  children,
}: {
  harasId: string;
  centreId?: string;
  permission?: Permission;
  children: React.ReactNode;
}) => {
  const { hydrated, can, canAccessCentre, canAccessHaras } = useSession();
  const { hydrated: databaseHydrated } = useMockDatabase();

  if (!hydrated || !databaseHydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const hasScopeAccess = centreId
    ? canAccessCentre(harasId, centreId)
    : canAccessHaras(harasId);

  if (!hasScopeAccess) {
    return (
      <Card className="border-amber-200/80 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-500/12">
        <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-500/16 dark:text-amber-200">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                Accès non validé
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-amber-900/80 dark:text-amber-100/80">
                Cette page est protégée. Connectez-vous via l'espace de connexion pour obtenir l'accès.
              </p>
            </div>
          </div>
          <Button asChild variant="accent">
            <Link href={buildAccessPath(harasId, centreId ? "centre" : "haras", centreId)}>
              Se connecter
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (permission && !can(permission)) {
    return (
      <Card className="border-rose-200/80 bg-rose-50/70 dark:border-rose-500/30 dark:bg-rose-500/12">
        <CardContent className="flex flex-col gap-4 p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700 dark:bg-rose-500/16 dark:text-rose-200">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Permission insuffisante
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-rose-900/80 dark:text-rose-100/80">
                Votre rôle actif ne permet pas d’accéder à cette page. Contactez
                votre administrateur pour un rôle approprié.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
