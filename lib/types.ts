export interface HistoryItem {
    role: "user" | "model";
    parts: HistoryPart[];
  }

  export interface HistoryPart {
    text?: string;
    image?: string;
  }
  
 
