"use client";

export default function QuantityStepper({ value, onChange, min = 1, max = Infinity, small = false }) {
  const btn = small ? "h-[26px] w-[26px] text-[0.95rem]" : "h-9 w-9 text-lg";
  return (
    <div className="inline-flex items-center overflow-hidden rounded-full border-[1.5px] border-grey-200">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className={`flex items-center justify-center hover:bg-grey-100 ${btn}`}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className={`text-center font-extrabold ${small ? "w-6 text-[0.88rem]" : "w-8"}`}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className={`flex items-center justify-center hover:bg-grey-100 ${btn}`}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
