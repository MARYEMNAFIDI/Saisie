"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { getHarasById } from "@/data/haras";
import { buildWorkspacePath } from "@/lib/navigation";
import { useMockDatabase } from "@/components/providers/mock-db-provider";
import { useSession } from "@/components/providers/session-provider";
import {
  createEmptyProductDraft,
  ProductDraft,
  ProductForm,
} from "@/components/forms/product-form";
import { ProtectedPage } from "@/components/access/protected-page";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ESIREMA_REGEX = /^\d{8}[A-Z]$/;
const normalizeEsirema = (value: string) => value.trim().toUpperCase();

export default function ProductPage() {
  const params = useParams<{ harasId: string }>();
  const harasId = params.harasId;

  const haras = getHarasById(harasId);
  const {
    getScopedSnapshot,
    upsertProduct,
    writeEnabled,
    error: storageError,
  } = useMockDatabase();
  const { session, can } = useSession();
  const snapshot = getScopedSnapshot(
    harasId,
    session.scope === "centre" ? session.centreId : undefined,
  );

  const [activeId, setActiveId] = useState<string>("new");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeId === "new" || snapshot.products.some((record) => record.id === activeId)) {
      return;
    }

    setActiveId(snapshot.products[0]?.id ?? "new");
  }, [activeId, snapshot.products]);

  if (!haras) {
    return null;
  }

  if (snapshot.mares.length === 0) {
    return (
      <ProtectedPage harasId={harasId}>
        <EmptyState
          icon={Plus}
          title="Aucune jument disponible"
          description="Ajoutez d'abord une fiche jument sur ce perimetre avant de faire une declaration de naissance."
        />
      </ProtectedPage>
    );
  }

  const activeRecord =
    activeId === "new"
      ? null
      : snapshot.products.find((record) => record.id === activeId) ?? null;

  const initialDraft: ProductDraft = activeRecord
    ? {
        id: activeRecord.id,
        mareId: activeRecord.mareId,
        harasId: activeRecord.harasId,
        centreId: activeRecord.centreId,
        season: activeRecord.season,
        previousProduct: activeRecord.previousProduct,
        siremaProduct: activeRecord.siremaProduct,
        birthDate: activeRecord.birthDate,
        sex: activeRecord.sex,
        breed: activeRecord.breed,
        declaration: activeRecord.declaration,
        identification: activeRecord.identification,
        productStatus: activeRecord.productStatus,
      }
    : createEmptyProductDraft(harasId, snapshot.mares[0]);

  const handleSave = async (draft: ProductDraft) => {
    if (!can("edit") || !writeEnabled || isSaving) {
      return;
    }

    const requiredChecks: Array<{ valid: boolean; label: string }> = [
      { valid: Boolean(draft.mareId.trim()), label: "Jument" },
      { valid: Boolean(draft.birthDate.trim()), label: "Date de naissance" },
      { valid: Boolean(draft.sex.trim()), label: "Sexe" },
      { valid: Boolean(draft.declaration.trim()), label: "Declaration" },
      { valid: Boolean(draft.identification.trim()), label: "Identification" },
      { valid: Boolean(draft.productStatus.trim()), label: "Statut" },
      { valid: Boolean(draft.previousProduct.trim()), label: "Produit precedent" },
      { valid: Boolean(draft.siremaProduct.trim()), label: "Reference SIREMA" },
      { valid: Boolean(draft.breed.trim()), label: "Race" },
      { valid: Boolean(draft.season.trim()), label: "Saison" },
    ];

    const missingLabels = requiredChecks
      .filter((item) => !item.valid)
      .map((item) => item.label);

    if (missingLabels.length > 0) {
      toast.error("Formulaire incomplet", {
        description: `Champs requis manquants: ${missingLabels.slice(0, 4).join(", ")}${
          missingLabels.length > 4 ? "..." : ""
        }`,
      });
      return;
    }

    const normalizedSirema = normalizeEsirema(draft.siremaProduct);
    if (!ESIREMA_REGEX.test(normalizedSirema)) {
      toast.error("Format ESIREMA invalide", {
        description:
          "Le N ESIREMA doit respecter le format 8 chiffres + 1 lettre (ex: 20101307C).",
      });
      return;
    }

    const mare = snapshot.mares.find((record) => record.id === draft.mareId);

    if (!mare) {
      toast.error("Selection incomplete", {
        description: "Selectionnez une jument avant d'enregistrer la declaration.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const savedRecord = await upsertProduct({
        ...draft,
        siremaProduct: normalizedSirema,
        harasId,
        centreId: mare.centreId,
        season: draft.season || mare.season,
        breed: draft.breed || mare.breed,
      });

      setActiveId(savedRecord.id);
      toast.success("Declaration enregistree", {
        description: `La naissance liee a ${mare.name} a ete enregistree.`,
      });
    } catch (saveError) {
      toast.error("Enregistrement impossible", {
        description:
          saveError instanceof Error
            ? saveError.message
            : storageError ?? "La declaration n'a pas pu etre enregistree.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedPage harasId={harasId}>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Parcours CRE"
          title="3. Declarer une naissance"
          description="Ajoutez ici le produit, sa reference et son statut. Cette etape vient apres la saisie reproduction."
          actions={
            <>
              <Button
                variant="accent"
                disabled={!can("edit") || !writeEnabled || isSaving}
                onClick={() => setActiveId("new")}
              >
                <Plus className="h-4 w-4" />
                Nouvelle declaration
              </Button>
              <Button asChild variant="outline">
                <Link href={buildWorkspacePath(harasId, "saisies")}>
                  Etape suivante: verification
                </Link>
              </Button>
            </>
          }
        />

        <div className="space-y-6">
          <ProductForm
            initialValue={initialDraft}
            mareOptions={snapshot.mares}
            readOnly={!can("edit") || !writeEnabled}
            isSaving={isSaving}
            onSave={handleSave}
          />

          <Card className="mx-auto w-full max-w-6xl">
            <CardHeader>
              <CardTitle>Declarations deja enregistrees</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {snapshot.products.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune declaration de naissance enregistree sur ce perimetre.
                </p>
              ) : (
                snapshot.products.map((record) => {
                  const mare = snapshot.mares.find((item) => item.id === record.mareId);

                  return (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => setActiveId(record.id)}
                      className={`w-full rounded-[1.25rem] border px-4 py-3 text-left transition-colors ${
                        activeId === record.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card/70 hover:bg-muted/40 dark:bg-card/45"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">
                            {mare?.name ?? "Jument non trouvee"}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {record.siremaProduct}
                          </p>
                        </div>
                        <Badge variant="outline">{record.productStatus}</Badge>
                      </div>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedPage>
  );
}
