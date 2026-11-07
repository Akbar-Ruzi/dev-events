import type { ComponentProps, ReactNode } from "react";

type FieldProps = {
    id: string;
    label: string;
    hint?: string;
    error?: string;
};

const CONTROL_CLASSES = "rounded-[10px] border bg-field px-3.5 text-base text-text";
const borderClass = (error?: string) => (error ? "border-danger-border" : "border-border");

const describedBy = ({ id, hint, error }: FieldProps) =>
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

const Field = ({ id, label, hint, error, required, children }: FieldProps & { required?: boolean; children: ReactNode }) => (
    <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-[15px] font-medium">
            {label} {required && <span className="text-accent">*</span>}
        </label>
        {children}
        {hint && <span id={`${id}-hint`} className="text-[13px] text-muted">{hint}</span>}
        {error && (
            <span id={`${id}-error`} className="flex items-center gap-1.5 text-[13px] text-danger-text">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v5M12 16v.01" />
                </svg>
                {error}
            </span>
        )}
    </div>
);

type InputProps = FieldProps & ComponentProps<"input">;

export const Input = ({ id, label, hint, error, className = "", ...props }: InputProps) => (
    <Field id={id} label={label} hint={hint} error={error} required={props.required}>
        <input
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy({ id, label, hint, error })}
            className={`h-[50px] ${CONTROL_CLASSES} ${borderClass(error)} ${className}`}
            {...props}
        />
    </Field>
);

type TextareaProps = FieldProps & ComponentProps<"textarea">;

export const Textarea = ({ id, label, hint, error, className = "", rows = 5, ...props }: TextareaProps) => (
    <Field id={id} label={label} hint={hint} error={error} required={props.required}>
        <textarea
            id={id}
            rows={rows}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy({ id, label, hint, error })}
            className={`resize-y py-3 leading-normal ${CONTROL_CLASSES} ${borderClass(error)} ${className}`}
            {...props}
        />
    </Field>
);
