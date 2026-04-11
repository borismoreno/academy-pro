import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import LoadingSpinner from './LoadingSpinner';

type DialogVariant = 'default' | 'destructive';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  variant?: DialogVariant;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  isLoading = false,
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="tertiary"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>

          {variant === 'destructive' ? (
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 py-2 text-sm font-semibold rounded-xl bg-error-container text-on-surface transition-opacity hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : null}
              {confirmLabel}
            </button>
          ) : (
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 py-2 text-sm font-semibold rounded-xl bg-gradient-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : null}
              {confirmLabel}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
