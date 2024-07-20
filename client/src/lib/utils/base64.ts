export const imageUrlToBase64 = async (url: string): Promise<string> => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data);
    };
    reader.onerror = reject;
  });
};

export const base64ToFile = (
  base64: string,
  fileName: string,
  mimeType: string
): File => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const file = new File([byteArray], fileName, { type: mimeType });

  return file;
};
