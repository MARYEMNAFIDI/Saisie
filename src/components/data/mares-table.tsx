"use client";

import Link from "next/link";
import { Download, Eye, PencilLine } from "lucide-react";

import { buildWorkspacePath } from "@/lib/navigation";
import { formatShortDate } from "@/lib/utils";
import { MareRecord } from "@/types/domain";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const MaresTable = ({
  harasId,
  records,
  centresById,
  canEdit,
  canExport,
  onExport,
}: {
  harasId: string;
  records: MareRecord[];
  centresById: Record<string, string>;
  canEdit: boolean;
  canExport: boolean;
  onExport: (record: MareRecord) => void;
}) => (
  <div className="surface-card overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Jument</TableHead>
          <TableHead>FARAS</TableHead>
          <TableHead>Race</TableHead>
          <TableHead>Centre</TableHead>
          <TableHead>Saison</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Mise à jour</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
              Aucune fiche jument ne correspond aux filtres actifs.
            </TableCell>
          </TableRow>
        ) : (
          records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <div>
                  <p className="font-semibold text-foreground">{record.name}</p>
                  <p className="text-xs text-muted-foreground">{record.owner}</p>
                </div>
              </TableCell>
              <TableCell>{record.farasNumber}</TableCell>
              <TableCell>{record.breed}</TableCell>
              <TableCell>{centresById[record.centreId] ?? "Centre non trouvé"}</TableCell>
              <TableCell>{record.season}</TableCell>
              <TableCell>
                <Badge
                  variant={record.admissionStatus === "acceptee" ? "success" : "danger"}
                >
                  {record.admissionStatus}
                </Badge>
              </TableCell>
              <TableCell>{formatShortDate(record.updatedAt)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={buildWorkspacePath(harasId, `juments/${record.id}`)}>
                      <Eye className="h-4 w-4" />
                      Voir
                    </Link>
                  </Button>
                  {canEdit ? (
                    <Button asChild size="sm" variant="ghost">
                      <Link href={buildWorkspacePath(harasId, `juments/${record.id}`)}>
                        <PencilLine className="h-4 w-4" />
                        Modifier
                      </Link>
                    </Button>
                  ) : null}
                  {canExport ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onExport(record)}
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
);
