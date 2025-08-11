import { useState, useEffect } from "react";

let showLoadingCallback: ((show: boolean) => void) | null = null;

export const showLoading = (show: boolean) => {
  if (showLoadingCallback) {
    showLoadingCallback(show);
  }
};

export default function LoadingOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    showLoadingCallback = setIsVisible;
    return () => {
      showLoadingCallback = null;
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="loading-overlay">
      <div className="bg-white rounded-xl p-8 max-w-sm mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="font-medium text-slate-900">Processing URL...</span>
        </div>
        <p className="text-sm text-slate-600">
          We're extracting content and generating an AI summary. This usually takes 10-15 seconds.
        </p>
      </div>
    </div>
  );
}
