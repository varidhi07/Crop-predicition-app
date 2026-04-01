import { useLand } from "@/contexts/LandContext";
import { MapPin, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LandSelector() {
  const { lands, selectedLand, selectLand } = useLand();

  if (!selectedLand) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors text-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">{selectedLand.name}</span>
          <span className="text-muted-foreground hidden sm:inline">· {selectedLand.area} acres</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {lands.map((land) => (
          <DropdownMenuItem
            key={land.id}
            onClick={() => selectLand(land.id)}
            className={land.id === selectedLand.id ? "bg-primary/10 text-primary" : ""}
          >
            <div className="flex flex-col">
              <span className="font-medium">{land.name}</span>
              <span className="text-xs text-muted-foreground">
                {land.location} · {land.area} acres
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}