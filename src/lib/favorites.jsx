import { createContext, useCallback, useContext, useEffect, useState } from "react";

const KEY = "edulime-favorites";
const FavCtx = createContext(null);
export const useFavorites = () => useContext(FavCtx);

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  const toggle = (id) =>
    setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const has = (id) => ids.includes(id);

  return <FavCtx.Provider value={{ ids, toggle, has }}>{children}</FavCtx.Provider>;
}
