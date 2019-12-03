export interface Traceable {
  position: {
    x: number;
    y: number;
  };
  type: string;
}

// ----- Declaring Constants -----

export interface TraceableAttractiveTarget extends Traceable {
  type: string;
  index: number;
  position: {
    x: number;
    y: number;
  };
  orientation?: {
    x: number;
    y: number;
  };
}

export interface TraceableRepulsiveTarget extends Traceable {
  type: string;
  position: {
    x: number;
    y: number;
  };
}
