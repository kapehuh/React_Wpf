// hooks/UseCopyToClipboard.js
import { useState } from 'react';
import { copyToClipboard } from '../actions/CopyToClipboard';

export const useCopyToClipboard = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const copy = async (text) => {
    const success = await copyToClipboard(text);
    if (success) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 1000);
    }
    return success;
  };

  return { copy, showTooltip, setShowTooltip };
};