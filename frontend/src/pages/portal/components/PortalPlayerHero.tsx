import { useRef, useState } from "react";
import { Users, Calendar, TrendingUp, Camera } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/hooks/use-toast";
import { uploadFile } from "@/services/storage.service";
import { updatePlayerPhoto } from "@/services/players.service";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import type { PlayerResponse } from "@/services/portal.service";

interface PortalPlayerHeroProps {
  player: PlayerResponse | undefined;
  isLoading: boolean;
  selectedPlayerId?: string;
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function SkeletonHero() {
  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden animate-pulse">
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />
      <div className="p-6">
        <div className="flex flex-row gap-4 items-center">
          <div
            className="rounded-full bg-surface-highest shrink-0"
            style={{ width: 64, height: 64 }}
          />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 bg-surface-highest rounded" />
            <div className="h-5 w-24 bg-surface-highest rounded-full" />
            <div className="h-4 w-36 bg-surface-highest rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface PlayerAvatarProps {
  photoUrl: string | null | undefined;
  fullName: string;
  isParent: boolean;
  playerId: string;
  selectedPlayerId: string | undefined;
}

function PlayerAvatar({
  photoUrl,
  fullName,
  isParent,
  playerId,
  selectedPlayerId,
}: PlayerAvatarProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<
    string | null | undefined
  >(photoUrl);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const previousUrl = currentPhotoUrl;
    setUploading(true);

    try {
      const publicUrl = await uploadFile(file);
      await updatePlayerPhoto(playerId, publicUrl);
      setCurrentPhotoUrl(publicUrl);
      queryClient.invalidateQueries({
        queryKey: ["portal-player", selectedPlayerId],
      });
      toast({ description: "Foto actualizada correctamente" });
    } catch {
      toast({
        description: "Error al actualizar la foto. Intenta de nuevo.",
        variant: "destructive",
      });
      setCurrentPhotoUrl(previousUrl);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const avatarContent = currentPhotoUrl ? (
    <img
      src={currentPhotoUrl}
      alt={fullName}
      className="w-full h-full object-cover"
    />
  ) : (
    <span
      className="font-display font-bold text-primary leading-none"
      style={{ fontSize: "2rem" }}
    >
      {getInitials(fullName)}
    </span>
  );

  if (!isParent) {
    return (
      <div
        className="rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-surface-highest"
        style={{ width: 64, height: 64 }}
      >
        {avatarContent}
      </div>
    );
  }

  return (
    <div className="group flex flex-col items-center gap-1.5 shrink-0">
      <div className="relative" style={{ width: 64, height: 64 }}>
        <button
          type="button"
          onClick={() => {
            setShowHint(true);
            setTimeout(() => setShowHint(false), 2000);
            fileInputRef.current?.click();
          }}
          className="rounded-full overflow-hidden flex items-center justify-center bg-surface-highest w-full h-full focus:outline-none"
          aria-label="Cambiar foto del jugador"
        >
          {avatarContent}
        </button>

        {/* Upload loading overlay */}
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-surface-high/80 backdrop-blur-sm flex items-center justify-center">
            <LoadingSpinner size="sm" />
          </div>
        )}

        {/* Camera edit button */}
        {!uploading && (
          <button
            type="button"
            onClick={() => {
              setShowHint(true);
              setTimeout(() => setShowHint(false), 2000);
              fileInputRef.current?.click();
            }}
            className="absolute bottom-0 right-0 bg-primary text-on-primary rounded-full p-1.5 cursor-pointer shadow-[0px_2px_8px_rgba(0,0,0,0.4)] hover:bg-secondary transition-colors"
            aria-label="Subir foto"
          >
            <Camera size={16} />
          </button>
        )}

        {/* Tap hint tooltip — only visible briefly after tap */}
        <span
          className={[
            "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-1",
            "bg-surface-highest text-on-surface-variant text-xs rounded-lg px-2 py-1 whitespace-nowrap",
            "pointer-events-none transition-opacity duration-300",
            showHint ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          Toca para cambiar la foto
        </span>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

export default function PortalPlayerHero({
  player,
  isLoading,
  selectedPlayerId,
}: PortalPlayerHeroProps) {
  const role = useAuthStore((s) => s.role);
  const isParent = role === "parent";

  if (isLoading || !player) return <SkeletonHero />;

  const age = calculateAge(player.birthDate);

  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      {/* Top glow */}
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />

      <div className="p-5 flex flex-col gap-3">
        <div className="flex flex-row gap-4 items-start">
          {/* Avatar / Photo */}
          <PlayerAvatar
            photoUrl={player.photoUrl}
            fullName={player.fullName}
            isParent={isParent}
            playerId={player.id}
            selectedPlayerId={selectedPlayerId}
          />

          {/* Info */}
          <div className="flex flex-col gap-1 min-w-0">
            <h2 className="font-display text-[1.25rem] lg:text-[2rem] font-bold text-on-surface leading-tight">
              {player.fullName}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {player.position && (
                <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] bg-surface-highest text-secondary rounded-full px-3 py-1">
                  {player.position}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-1">
              {player.team && (
                <span className="flex items-center gap-1.5 font-body text-sm text-on-surface-variant">
                  <Users size={14} className="shrink-0" />
                  {player.team.name}
                </span>
              )}

              <span className="flex items-center gap-1.5 font-body text-sm text-on-surface-variant">
                <Calendar size={14} className="shrink-0" />
                {age} años
              </span>
            </div>

            <span className="flex items-center gap-1 font-body text-[0.6875rem] uppercase tracking-[0.05em] text-primary mt-1">
              <TrendingUp size={14} />
              Siguiendo su progreso
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
