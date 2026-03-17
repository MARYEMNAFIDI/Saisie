import { cn } from "@/lib/utils";

export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "relative overflow-hidden flex flex-col gap-4 rounded-[1.5rem] border border-slate-200/80 bg-slate-50/85 p-5 shadow-soft backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between",
      className,
    )}
  >
    <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
    <div className="max-w-3xl space-y-3">
      <p className="section-caption">{eyebrow}</p>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground lg:text-base">
          {description}
        </p>
      </div>
    </div>
    {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
  </div>
);
