import { createContext, useContext, useState } from "react";

const defaultLands = [
  {
    id: "1",
    name: "North Field",
    location: "Punjab, India",
    area: 12,
    nitrogen: 90,
    phosphorus: 42,
    potassium: 43,
    ph: 6.5,
    temperature: 28,
    humidity: 72,
    rainfall: 200,
  },
  {
    id: "2",
    name: "River Plot",
    location: "Haryana, India",
    area: 8,
    nitrogen: 45,
    phosphorus: 55,
    potassium: 20,
    ph: 7.1,
    temperature: 30,
    humidity: 65,
    rainfall: 150,
  },
];

const LandContext = createContext(undefined);

export function LandProvider({ children }) {
  const [lands, setLands] = useState(defaultLands);
  const [selectedLandId, setSelectedLandId] = useState(defaultLands[0].id);

  const selectedLand = lands.find((l) => l.id === selectedLandId);

  const addLand = (land) => {
    const newLand = { ...land, id: Date.now().toString() };
    setLands((prev) => [...prev, newLand]);
  };

  const updateLand = (id, data) => {
    setLands((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
  };

  const deleteLand = (id) => {
    setLands((prev) => prev.filter((l) => l.id !== id));
    if (selectedLandId === id) {
      setSelectedLandId(lands.find((l) => l.id !== id)?.id || "");
    }
  };

  const selectLand = (id) => setSelectedLandId(id);

  return (
    <LandContext.Provider
      value={{
        lands,
        selectedLandId,
        selectedLand,
        addLand,
        updateLand,
        deleteLand,
        selectLand,
      }}
    >
      {children}
    </LandContext.Provider>
  );
}

export function useLand() {
  const ctx = useContext(LandContext);
  if (!ctx) throw new Error("useLand must be used within LandProvider");
  return ctx;
}