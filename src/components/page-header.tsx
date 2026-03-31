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
      "relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--card)/0.84),hsl(var(--muted)/0.72))] p-5 shadow-soft backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.9))] dark:shadow-[0_22px_55px_-36px_rgba(2,6,23,0.82)] lg:p-6",
      className,
    )}
  >
    <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
    <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-accent/12 blur-3xl" />

    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl space-y-3">
        <p className="section-caption">{eyebrow}</p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground lg:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground lg:text-base">
            {description}
          </p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  </div>
);
