"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { getHarasById } from "@/data/haras";
import { useMockDatabase } from "@/components/providers/mock-db-provider";
import { useSession } from "@/components/providers/session-provider";
import {
  createEmptyProductDraft,
  ProductDraft,
  ProductForm,
} from "@/components/forms/product-form";
import { ProtectedPage } from "@/components/access/protected-page";
import { EmptyState } from "@/components/empty-state";
import { FertilityIndices } from "@/components/fertility-indices";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductPage() {
  const params = useParams<{ harasId: string }>();
  const harasId = params.harasId;

  const haras = getHarasById(harasId);
  const { getScopedSnapshot, upsertProduct } = useMockDatabase();
  const { session, can } = useSession();
  const snapshot = getScopedSnapshot(
    harasId,
    session.scope === "centre" ? session.centreId : undefined,
  );

  const [activeId, setActiveId] = useState<string>("new");

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
          description="Ajoutez d'abord une fiche jument sur ce perimetre avant de declarer une production."
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

  const handleSave = (draft: ProductDraft) => {
    if (!can("edit")) {
      return;
    }

    const mare = snapshot.mares.find((record) => record.id === draft.mareId);

    if (!mare) {
      toast.error("Selection incomplete", {
        description: "Selectionnez une jument avant d'enregistrer la production.",
      });
      return;
    }

    const savedRecord = upsertProduct({
      ...draft,
      harasId,
      centreId: mare.centreId,
      season: draft.season || mare.season,
      breed: draft.breed || mare.breed,
    });

    setActiveId(savedRecord.id);
    toast.success("Production enregistree", {
      description: `La production liee a ${mare.name} a ete enregistree localement.`,
    });
  };

  return (
    <ProtectedPage harasId={harasId}>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Formulaire production"
          title="Production"
          description="La naissance reste geree a part dans cet ecran de production."
          actions={
            <Button
              disabled={!can("edit")}
              onClick={() => setActiveId("new")}
            >
              <Plus className="h-4 w-4" />
              Nouvelle production
            </Button>
          }
        />

        <div className="space-y-6">
          <ProductForm
            initialValue={initialDraft}
            mareOptions={snapshot.mares}
            readOnly={!can("edit")}
            onSave={handleSave}
          />

          <Card className="mx-auto w-full max-w-6xl">
            <CardHeader>
              <CardTitle>Historique production</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {snapshot.products.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune production enregistree sur ce perimetre.
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
                          : "border-border bg-white/85 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">
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

        <FertilityIndices
          mares={snapshot.mares}
          reproductions={snapshot.reproductions}
          products={snapshot.products}
        />
      </div>
    </ProtectedPage>
  );
}
