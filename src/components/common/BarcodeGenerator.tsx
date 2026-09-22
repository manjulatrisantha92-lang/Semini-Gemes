import React from 'react';

interface BarcodeGeneratorProps {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
  className?: string;
}

export const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({
  value,
  width = 240,
  height = 52,
  showText = true,
  className = '',
}) => {
  // Simple, deterministic pseudo-code 128/39 bar pattern generator
  const cleanValue = String(value || '000000').toUpperCase();
  const bars = React.useMemo(() => {
    const clean = cleanValue;
    const pattern: number[] = [2, 1, 1, 2, 1]; // Start pattern
    
    for (let i = 0; i < clean.length; i++) {
      const code = clean.charCodeAt(i);
      // Generate varying bar widths: 1, 2, 3, or 4 units
      pattern.push(((code * 3 + i) % 3) + 1);
      pattern.push(((code * 7 + i * 2) % 2) + 1);
      pattern.push(((code * 5 + i * 4) % 3) + 1);
      pattern.push(1); // spacer
    }
    
    pattern.push(2, 1, 2, 2); // Stop pattern
    return pattern;
  }, [cleanValue]);

  const totalUnits = bars.reduce((a, b) => a + b, 0) || 1;
  const unitWidth = width / totalUnits;

  let currentX = 0;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        {bars.map((barWidth, index) => {
          const isBlack = index % 2 === 0;
          const rectWidth = barWidth * unitWidth;
          const rect = isBlack ? (
            <rect
              key={index}
              x={currentX}
              y={0}
              width={rectWidth}
              height={height}
              fill="#000000"
            />
          ) : null;
          currentX += rectWidth;
          return rect;
        })}
      </svg>
      {showText && (
        <span className="font-mono text-[11px] font-bold tracking-[0.25em] text-black mt-1 uppercase">
          *{value}*
        </span>
      )}
    </div>
  );
};
