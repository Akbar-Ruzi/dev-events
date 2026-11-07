import type { ButtonHTMLAttributes } from "react";

const VARIANTS = {
    primary: "bg-accent font-bold text-on-accent",
    secondary: "border border-border bg-transparent font-medium text-text",
    "accent-outline": "border border-accent bg-transparent font-bold text-accent",
    danger: "bg-danger font-bold text-white",
    "danger-outline": "border border-danger-outline bg-transparent font-medium text-danger-text",
};

const SIZES = {
    lg: "min-h-[52px] px-[22px] text-base",
    md: "min-h-11 px-3.5 text-sm",
    dialog: "min-h-11 px-[18px] text-[15px]",
};

type ButtonStyle = {
    variant?: keyof typeof VARIANTS;
    size?: keyof typeof SIZES;
    className?: string;
};

// Also used on a Link, so a link can look like a button.
export const buttonClasses = ({ variant = "primary", size = "lg", className = "" }: ButtonStyle = {}) =>
    `inline-flex cursor-pointer items-center justify-center rounded-[10px] disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyle;

const Button = ({ variant, size, className, type = "button", ...props }: ButtonProps) => (
    <button type={type} className={buttonClasses({ variant, size, className })} {...props} />
);

export default Button;
