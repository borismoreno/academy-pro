import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useCreateAcademy } from "@/hooks/useOwner";
import { toast } from "@/hooks/use-toast";

interface AcademyFormDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AcademyFormDialog({ open, onClose }: AcademyFormDialogProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [directorEmail, setDirectorEmail] = useState("");
  const [directorName, setDirectorName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const createAcademy = useCreateAcademy();

  function resetForm() {
    setName("");
    setCity("");
    setDirectorEmail("");
    setDirectorName("");
    setAddress("");
    setPhone("");
    setEmail("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createAcademy.mutate(
      {
        name,
        city,
        directorEmail,
        directorName,
        address: address || undefined,
        phone: phone || undefined,
        email: email || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: "Academia creada",
            description: "Academia creada. Se envió la invitación al director.",
          });
          handleClose();
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-130 bg-surface-high border-outline-variant/15 rounded-3xl p-0 overflow-hidden shadow-[0px_24px_48px_rgba(0,0,0,0.5)]">
        {/* Top glow */}
        <div
          className="h-0.5 w-full"
          style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
        />

        <div className="px-8 py-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-display text-[1.75rem] font-semibold text-on-surface">
              Nueva academia
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                Nombre de la academia *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Academia Fútbol Ecuador"
                required
                minLength={2}
              />
            </div>

            {/* City */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                Ciudad *
              </label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Quito"
                required
              />
            </div>

            {/* Director email */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                Email del director *
              </label>
              <Input
                type="email"
                value={directorEmail}
                onChange={(e) => setDirectorEmail(e.target.value)}
                placeholder="director@academia.com"
                required
              />
            </div>

            {/* Director name */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                Nombre del director *
              </label>
              <Input
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                placeholder="Juan García"
                required
                minLength={2}
              />
            </div>

            {/* Address (optional) */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                Dirección
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Av. Principal 123"
              />
            </div>

            {/* Phone (optional) */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                Teléfono
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+593 99 999 9999"
              />
            </div>

            {/* Academy email (optional) */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                Email de la academia
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@academia.com"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={createAcademy.isPending}
            >
              {createAcademy.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Crear academia y enviar invitación"
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
