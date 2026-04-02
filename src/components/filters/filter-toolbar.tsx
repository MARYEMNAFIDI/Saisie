"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { breedOptions, seasonOptions } from "@/data/mockRecords";
import { Centre, RecordFilters } from "@/types/domain";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterKey = keyof RecordFilters;

export const FilterToolbar = ({
  filters,
  onChange,
  centres,
  harasLabel,
}: {
  filters: RecordFilters;
  onChange: (key: FilterKey, value: string) => void;
  centres: Centre[];
  harasLabel: string;
}) => {
  const hasAdvancedFilters =
    filters.centreId !== "all" || filters.season !== "all" || filters.breed !== "all";
  const [showAdvanced, setShowAdvanced] = useState(hasAdvancedFilters);

  return (
    <div className="surface-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-secondary/80 p-2.5 text-primary">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <p className="section-caption">Recherche rapide</p>
              <p className="text-sm text-muted-foreground">
                Commencez par le nom de la jument, le FARAS ou le proprietaire.
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(event) => onChange("search", event.target.value)}
              placeholder="Rechercher une jument, un FARAS ou un proprietaire"
              className="pl-11"
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Perimetre: <span className="font-semibold text-foreground">{harasLabel}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced((value) => !value)}
          >
            {showAdvanced ? "Masquer les filtres" : "Plus de filtres"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange("search", "");
              onChange("centreId", "all");
              onChange("season", "all");
              onChange("breed", "all");
              setShowAdvanced(false);
            }}
          >
            Reinitialiser
          </Button>
        </div>
      </div>

      {showAdvanced || hasAdvancedFilters ? (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Select value={filters.centreId} onValueChange={(value) => onChange("centreId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Centre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les centres</SelectItem>
              {centres.map((centre) => (
                <SelectItem key={centre.id} value={centre.id}>
                  {centre.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.season} onValueChange={(value) => onChange("season", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Saison" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les saisons</SelectItem>
              {seasonOptions.map((season) => (
                <SelectItem key={season} value={season}>
                  {season}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.breed} onValueChange={(value) => onChange("breed", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Race" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les races</SelectItem>
              {breedOptions.map((breed) => (
                <SelectItem key={breed} value={breed}>
                  {breed}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
};
