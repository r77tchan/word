import Link from "next/link";

const listLinks = [
  {
    href: "/list",
    label: "英検-2級-頻出200語",
    className: "bg-red-300",
  },
  { href: "/", label: "ダミー", className: "bg-yellow-300" },
  { href: "/", label: "ダミー", className: "bg-yellow-300" },
];

const cardLinks = [
  { href: "/", label: "ダミー", className: "bg-yellow-300" },
  { href: "/", label: "ダミー", className: "bg-yellow-300" },
  { href: "/", label: "ダミー", className: "bg-yellow-300" },
  { href: "/", label: "ダミー", className: "bg-yellow-300" },
  { href: "/", label: "ダミー", className: "bg-yellow-300" },
  { href: "/", label: "ダミー", className: "bg-yellow-300" },
];

export default function Home() {
  return (
    <main>
      <div className="h-96 w-full bg-gray-300"></div>
      <div className="mx-auto max-w-7xl p-4">
        <h1 className="py-4">
          <span className="border-b-2 border-green-300">Home</span>
        </h1>
        <h2 className="py-4">
          <span className="border-b-2 border-green-300">単語リスト</span>
        </h2>
        <div className="grid auto-rows-fr grid-cols-2 gap-4 pb-8 md:grid-cols-3 lg:grid-cols-4">
          {listLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className={`${link.className} flex h-full items-center justify-center p-4`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <h2 className="py-4">
          <span className="border-b-2 border-green-300">単発カード</span>
        </h2>
        <div className="grid auto-rows-fr grid-cols-2 gap-4 pb-8 md:grid-cols-3 lg:grid-cols-4">
          {cardLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className={`${link.className} flex h-full items-center justify-center p-4`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
