import { useRef, useState } from "react";
import { Image } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { uploadFile } from "@/services/storage.service";

interface Props {
  currentLogoUrl: string | null;
  onUploadComplete: (logoUrl: string) => void;
}

type UploadState = "idle" | "uploading";

export default function LogoUploader({
  currentLogoUrl,
  onUploadComplete,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl);

  function handleButtonClick() {
    inputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // if (file.size > 2 * 1024 * 1024) {
    //   toast({
    //     title: 'Error',
    //     description: 'La imagen no debe superar los 2MB',
    //     variant: 'destructive',
    //   });
    //   return;
    // }

    setUploadState("uploading");
    try {
      const publicUrl = await uploadFile(file);
      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);
    } catch {
      toast({
        title: "Error",
        description: "Error al subir la imagen. Intenta de nuevo.",
        variant: "destructive",
      });
      setPreviewUrl(currentLogoUrl);
    } finally {
      setUploadState("idle");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-highest flex items-center justify-center shrink-0">
        {uploadState === "uploading" ? (
          <LoadingSpinner size="md" />
        ) : previewUrl ? (
          <img
            src={previewUrl}
            alt="Logo de la academia"
            className="w-full h-full object-cover"
          />
        ) : (
          <Image size={32} className="text-on-surface-variant" />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={handleButtonClick}
        disabled={uploadState === "uploading"}
        className="font-body text-sm text-on-surface-variant hover:text-primary transition-colors min-h-11 px-3 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      >
        {previewUrl ? "Cambiar logo" : "Subir logo"}
      </button>
    </div>
  );
}
