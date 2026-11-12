import { useId, type CSSProperties } from "react";
import { useI18n } from "../settings/SettingsContext";
import { Tex } from "./Math";

interface SliderProps {
  /** TeX symbol shown as the label, e.g. "\\mu". */
  symbol: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  decimals?: number;
  /** Text to show instead of the raw value (e.g. for sliders over a list of steps). */
  display?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function Slider({ symbol, name, value, min, max, step, decimals = 1, display, disabled, onChange }: SliderProps) {
  const id = useId();
  const { fmt } = useI18n();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="slider">
      <div className="slider-head">
        <label htmlFor={id} className="slider-label">
          <Tex>{symbol}</Tex>
          <span className="slider-name">{name}</span>
        </label>
        <output htmlFor={id} className="slider-value">
          {display ?? fmt.num(value, decimals)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={display}
        style={{ "--fill": `${fill}%` } as CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
