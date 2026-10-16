import type { Dispatch, SetStateAction } from "react";

export function HeadcountStepper({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 12,
}: {
  id: string;
  label: string;
  value: number;
  onChange: Dispatch<SetStateAction<number>>;
  min?: number;
  max?: number;
}) {
  return (
    <div className="rsvp-stepper" role="group" aria-labelledby={`${id}-label`}>
      <span className="rsvp-stepper__label" id={`${id}-label`}>
        {label}
      </span>
      <div className="rsvp-stepper__controls">
        <button
          type="button"
          className="rsvp-stepper__btn"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange((n) => Math.max(min, n - 1))}
        >
          −
        </button>
        <span className="rsvp-stepper__value" aria-live="polite" id={id}>
          {value}
        </span>
        <button
          type="button"
          className="rsvp-stepper__btn"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange((n) => Math.min(max, n + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}
