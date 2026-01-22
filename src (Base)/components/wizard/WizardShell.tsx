// /components/wizard/WizardShell.tsx

"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDocStore } from "@/store/docStore";

function clampStep(s: string | null): 1 | 2 | 3 {
  if (s === "2") return 2;
  if (s === "3") return 3;
  return 1;
}

export function WizardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sp = useSearchParams();

  const step = useDocStore((s) => s.step);
  const setStep = useDocStore((s) => s.setStep);
  const hydrate = useDocStore((s) => s.hydrate);
  const hydrated = useDocStore((s) => s.hydrated);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const urlStep = clampStep(sp.get("step"));
    if (urlStep !== step) setStep(urlStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const goTo = (next: 1 | 2 | 3) => {
    setStep(next);
    router.replace(`/nuevo?step=${next}`);
  };

  if (!hydrated) return null;

  const canExport = step === 3; // luego lo amarramos a validación final

  return (
    <div className="min-h-screen">
      {/* HEADER sticky */}
      <div className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Breadcrumb */}
          <div className="text-sm text-muted-foreground">
            Dashboard → Documentación → Registrar servicio nuevo → Paso {step}
          </div>

          {/* Export: solo final */}
          <Button
            disabled={!canExport}
            onClick={() => {
              // aquí luego llamamos el Server Action de exceljs
            }}
          >
            Exportar
          </Button>
        </div>
      </div>

      {/* CONTENT */}
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

      {/* FOOTER sticky */}
      <div className="sticky bottom-0 z-40 border-t bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Button
            variant="secondary"
            disabled={step === 1}
            onClick={() => goTo((step - 1) as 1 | 2 | 3)}
          >
            Atrás
          </Button>

          <Button
            disabled={step === 3}
            onClick={() => goTo((step + 1) as 1 | 2 | 3)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
