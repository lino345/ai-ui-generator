type ButtonProps = {
  label: string;
};

export function Button({ label }: ButtonProps) {
  return (
    <button className="bg-blue-500 text-white px-4 py-2 rounded">
      {label}
    </button>
  );
}
