"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { getHarasById } from "@/data/haras";
import { ProtectedPage } from "@/components/access/protected-page";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const params = useParams<{ harasId: string }>();
  const harasId = params.harasId;
  const haras = getHarasById(harasId);

  if (!haras) {
    return null;
  }

  return (
    <ProtectedPage harasId={harasId}>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Administration"
          title="Gestion centralisee"
          description="La gestion des utilisateurs et des roles se fait uniquement depuis le portail admin."
        />

        <Card>
          <CardHeader>
            <CardTitle>Acces reserve au portail admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cette zone de session locale est desactivee dans les espaces haras/CRE.
              Pour gerer les utilisateurs, affecter les roles ou exporter les donnees,
              utilisez uniquement l espace admin.
            </p>
            <Button asChild>
              <Link href="/admin">Ouvrir le portail admin</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProtectedPage>
  );
}
