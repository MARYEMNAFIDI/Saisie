import { rolesById } from "@/data/roles";
import { UserRole } from "@/types/domain";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

export const RoleBadge = ({
  role,
  className,
}: {
  role: UserRole;
  className?: string;
}) => {
  const roleConfig = rolesById[role];

  return (
    <Badge className={cn("border", roleConfig.badge, className)}>
      {roleConfig.label}
    </Badge>
  );
};
