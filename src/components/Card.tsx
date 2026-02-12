export function Card({ title, children }: { 
  title: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded p-4 shadow-sm bg-white text-black">
      <h2 className="font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}
