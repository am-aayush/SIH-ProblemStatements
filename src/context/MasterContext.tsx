import React, { createContext, useContext, useState, useEffect } from 'react';

interface MasterContextType {
  masterToken: string | null;
  loginMaster: (token: string) => void;
  logoutMaster: () => void;
}

const MasterContext = createContext<MasterContextType>({
  masterToken: null,
  loginMaster: () => {},
  logoutMaster: () => {},
});

export const MasterProvider = ({ children }: { children: React.ReactNode }) => {
  const [masterToken, setMasterToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('masterToken');
    if (token) {
      setMasterToken(token);
    }
  }, []);

  const loginMaster = (token: string) => {
    localStorage.setItem('masterToken', token);
    setMasterToken(token);
  };

  const logoutMaster = () => {
    localStorage.removeItem('masterToken');
    setMasterToken(null);
  };

  return (
    <MasterContext.Provider value={{ masterToken, loginMaster, logoutMaster }}>
      {children}
    </MasterContext.Provider>
  );
};

export const useMasterAuth = () => useContext(MasterContext);
