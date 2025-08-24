"use client";

import { toast as sonnerToast } from "sonner";

// Toast hook that wraps sonner for shadcn/ui compatibility
export function useToast() {
  const toast = (props) => {
    const { title, description, variant = "default", ...rest } = props;
    
    if (variant === "destructive") {
      return sonnerToast.error(title || description, {
        description: title ? description : undefined,
        ...rest
      });
    }
    
    if (variant === "success") {
      return sonnerToast.success(title || description, {
        description: title ? description : undefined,
        ...rest
      });
    }
    
    return sonnerToast(title || description, {
      description: title ? description : undefined,
      ...rest
    });
  };

  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}

// Export individual toast methods for convenience
export const toast = {
  success: (message, options) => sonnerToast.success(message, options),
  error: (message, options) => sonnerToast.error(message, options),
  info: (message, options) => sonnerToast.info(message, options),
  warning: (message, options) => sonnerToast.warning(message, options),
  loading: (message, options) => sonnerToast.loading(message, options),
  dismiss: sonnerToast.dismiss,
};