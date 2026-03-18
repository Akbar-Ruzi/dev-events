"use client";

import { createContext, useContext, useMemo, useState } from "react";

type NavbarLockContextValue = {
  isNavbarDisabled: boolean;
  setIsNavbarDisabled: (value: boolean) => void;
};

const NavbarLockContext = createContext<NavbarLockContextValue | undefined>(undefined);

export const NavbarLockProvider = ({ children }: { children: React.ReactNode }) => {
  const [isNavbarDisabled, setIsNavbarDisabled] = useState(false);

  const value = useMemo(
    () => ({ isNavbarDisabled, setIsNavbarDisabled }),
    [isNavbarDisabled]
  );

  return (
    <NavbarLockContext.Provider value={value}>
      {children}
    </NavbarLockContext.Provider>
  );
};

export const useNavbarLock = () => {
  const context = useContext(NavbarLockContext);
  if (!context) {
    throw new Error("useNavbarLock must be used inside NavbarLockProvider");
  }
  return context;
};