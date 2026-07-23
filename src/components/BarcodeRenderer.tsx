import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeRendererProps {
  value: string;
  format?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  margin?: number;
  className?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  format = 'CODE128',
  width = 1.8,
  height = 40,
  displayValue = true,
  fontSize = 12,
  margin = 4,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: format || 'CODE128',
          width,
          height,
          displayValue,
          fontSize,
          margin,
          textMargin: 2,
          font: 'monospace',
          lineColor: '#000000',
          background: '#ffffff',
        });
      } catch (err) {
        console.error('JsBarcode rendering error:', err);
      }
    }
  }, [value, format, width, height, displayValue, fontSize, margin]);

  return <svg ref={svgRef} className={`max-w-full ${className}`} id={`barcode-${value}`} />;
};
