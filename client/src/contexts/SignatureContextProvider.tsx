import { createContext, ReactNode, useState } from 'react';

type Props = {
  signatureImage: string;
  setSignatureImage: (signatureImage: string) => void;
  trimmedSignatureImage: string;
  setTrimmedSignatureImage: (trimmedSignatureImage: string) => void;
};

export const SignatureContext = createContext<Props>({
  signatureImage: '',
  setSignatureImage: () => {},
  trimmedSignatureImage: '',
  setTrimmedSignatureImage: () => {},
});

const SignatureContextProvider = ({ children }: { children: ReactNode }) => {
  const [signatureImage, setSignatureImage] = useState<string>('');
  const [trimmedSignatureImage, setTrimmedSignatureImage] =
    useState<string>('');

  return (
    <SignatureContext.Provider
      value={{
        signatureImage,
        setSignatureImage,
        trimmedSignatureImage,
        setTrimmedSignatureImage,
      }}
    >
      {children}
    </SignatureContext.Provider>
  );
};

export default SignatureContextProvider;
