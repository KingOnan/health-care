function Button({
  children,
  bg = "bg-primary",
  text = "text-white",
  shadow = "shadow-[0_5px_10px_rgba(0,0,0,0.5)]",
  rounded = "rounded-full",
  minH = "min-h-14",
  px = "",
  py = "",
  className = "",
  ...props
}) {
  return (
    <button
      className={`${py} ${px} flex ${minH} items-center justify-center gap-2 ${rounded} ${bg} ${text} text-lg font-bold ${shadow} transition active:scale-[97.5%] active:shadow-none active:brightness-90 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
