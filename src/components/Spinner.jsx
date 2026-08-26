function Spinner({ size = "md", color }) {
  const sizes = { sm: 16, md: 24, lg: 40 };
  const px = sizes[size] || sizes.md;
  const resolvedColor = color || "#C9A24B";

  return (
    <div
      className="app-spinner"
      style={{
        width: px,
        height: px,
        border: `3px solid ${resolvedColor}33`,
        borderTopColor: resolvedColor,
        borderRadius: "50%",
      }}
    />
  );
}

export default Spinner;
