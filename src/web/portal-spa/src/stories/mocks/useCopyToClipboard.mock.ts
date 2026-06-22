export const useCopyToClipboard = () => {
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      console.log("[copy]", content);
    } catch (e) {
      console.error("[copy.error]", e);
    }
  };
  return { handleCopy };
};
