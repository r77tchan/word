import Link from "next/link";

const links = [
  { href: "/lesson", label: "レッスン", className: "bg-red-300" },
  { href: "/list", label: "リスト", className: "bg-blue-300" },
  { href: "/", label: "ダミー", className: "bg-yellow-300" },
  { href: "/", label: "ダミー", className: "bg-yellow-300" },
  { href: "/", label: "ダミー", className: "bg-yellow-300" },
  { href: "/", label: "ダミー", className: "bg-yellow-300" },
  { href: "/", label: "英検5級-200語", className: "bg-yellow-300" },
];

export default function Home() {
  return (
    <main>
      <div className="h-96 w-full bg-gray-300"></div>
      <div className="mx-auto max-w-7xl p-4">
        <h1 className="py-4">単語帳</h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className={`${link.className} p-4 text-center`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
