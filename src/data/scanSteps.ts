export interface ScanStep {
  primary: string;
  sub: string;
}

export const SCAN_STEPS: readonly ScanStep[] = [
  { primary: "Center face", sub: "reading facial patterns" },
  { primary: "Turn left", sub: "reading facial patterns" },
  { primary: "Turn right", sub: "interpreting visual identity" },
  { primary: "Tilt upward", sub: "interpreting visual identity" },
  { primary: "Tilt downward", sub: "estimating social potential" },
  { primary: "Move closer", sub: "estimating social potential" },
  { primary: "Move farther", sub: "measuring visibility potential" },
];
