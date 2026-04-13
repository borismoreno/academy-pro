import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import LogoUploader from './LogoUploader';
import type { Academy } from '@/types';
import type { UpdateAcademyData } from '@/services/settings.service';

interface Props {
  academy: Academy | null;
  onSubmit: (data: UpdateAcademyData) => void;
  isLoading: boolean;
}

export default function AcademyInfoForm({ academy, onSubmit, isLoading }: Props) {
  const [name, setName] = useState(academy?.name ?? '');
  const [city, setCity] = useState(academy?.city ?? '');
  const [address, setAddress] = useState(academy?.address ?? '');
  const [phone, setPhone] = useState(academy?.phone ?? '');
  const [email, setEmail] = useState(academy?.email ?? '');
  const [logoUrl, setLogoUrl] = useState<string | null>(academy?.logoUrl ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (academy) {
      setName(academy.name ?? '');
      setCity(academy.city ?? '');
      setAddress(academy.address ?? '');
      setPhone(academy.phone ?? '');
      setEmail(academy.email ?? '');
      setLogoUrl(academy.logoUrl ?? null);
    }
  // Only sync when the academy id changes (initial load)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academy?.id]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = 'El nombre debe tener al menos 2 caracteres';
    if (!city.trim()) errs.city = 'La ciudad es requerida';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      city: city.trim(),
      ...(address.trim() ? { address: address.trim() } : {}),
      ...(phone.trim() ? { phone: phone.trim() } : {}),
      ...(email.trim() ? { email: email.trim() } : {}),
      ...(logoUrl ? { logoUrl } : {}),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
        Información de la academia
      </h2>

      <LogoUploader currentLogoUrl={logoUrl} onUploadComplete={setLogoUrl} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Nombre */}
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-sm text-on-surface-variant">
            Nombre de la academia <span className="text-error-container">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            placeholder="Nombre de la academia"
          />
          {errors.name && (
            <p className="font-body text-xs text-error-container">{errors.name}</p>
          )}
        </div>

        {/* Ciudad / Dirección */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm text-on-surface-variant">
              Ciudad <span className="text-error-container">*</span>
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={isLoading}
              placeholder="Ciudad"
            />
            {errors.city && (
              <p className="font-body text-xs text-error-container">{errors.city}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm text-on-surface-variant">Dirección</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isLoading}
              placeholder="Dirección (opcional)"
            />
          </div>
        </div>

        {/* Teléfono / Email */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm text-on-surface-variant">Teléfono</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              placeholder="Teléfono (opcional)"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm text-on-surface-variant">
              Correo electrónico
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="correo@academia.com (opcional)"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 h-11 px-6 rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
