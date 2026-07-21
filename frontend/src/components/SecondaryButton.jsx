function SecondaryButton({
  children,
  border = "border-primary",
  text = "text-primary",
  className = "",
  ...props
}) {
  return (
    <button
      className={`min-h-14 rounded-full border-2 ${border} bg-surface text-lg font-bold ${text} transition active:scale-[97.5%] active:bg-page-bg ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default SecondaryButton;
