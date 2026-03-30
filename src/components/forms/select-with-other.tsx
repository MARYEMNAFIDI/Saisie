"use client";

import { ReactNode, useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OTHER_OPTION_VALUE = "__other__";

export const SelectWithOther = ({
  value,
  options,
  onValueChange,
  disabled,
  placeholder,
  otherOptionLabel = "Autre",
  otherPlaceholder = "Préciser",
  renderOptionLabel,
}: {
  value: string;
  options: readonly string[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  otherOptionLabel?: string;
  otherPlaceholder?: string;
  renderOptionLabel?: (option: string) => ReactNode;
}) => {
  const matchesKnownOption = options.includes(value);
  const hasCustomValue = value.trim().length > 0 && !matchesKnownOption;
  const [isOtherSelected, setIsOtherSelected] = useState(hasCustomValue);

  useEffect(() => {
    if (hasCustomValue) {
      setIsOtherSelected(true);
      return;
    }

    if (matchesKnownOption) {
      setIsOtherSelected(false);
    }
  }, [hasCustomValue, matchesKnownOption]);

  const showOtherInput = isOtherSelected || hasCustomValue;
  const selectValue = showOtherInput ? OTHER_OPTION_VALUE : value;

  return (
    <div className="space-y-3">
      <Select
        value={selectValue}
        disabled={disabled}
        onValueChange={(nextValue) => {
          if (nextValue === OTHER_OPTION_VALUE) {
            setIsOtherSelected(true);

            if (matchesKnownOption) {
              onValueChange("");
            }

            return;
          }

          setIsOtherSelected(false);
          onValueChange(nextValue);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {renderOptionLabel ? renderOptionLabel(option) : option}
            </SelectItem>
          ))}
          <SelectItem value={OTHER_OPTION_VALUE}>{otherOptionLabel}</SelectItem>
        </SelectContent>
      </Select>

      {showOtherInput ? (
        <Input
          value={hasCustomValue ? value : ""}
          disabled={disabled}
          placeholder={otherPlaceholder}
          onChange={(event) => onValueChange(event.target.value)}
        />
      ) : null}
    </div>
  );
};
