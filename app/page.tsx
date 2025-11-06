import Link from "next/link";

const listLinks = [
  {
    href: "/list?set=eiken-2-freq-200",
    label: "英検-2級-頻出200語",
    className: "bg-red-back",
  },
  { href: "/list", label: "英検9184語", className: "bg-blue-back" },
  { href: "/", label: "ダミー", className: "bg-yellow-back" },
];

const cardLinks = [
  { href: "/", label: "ダミー", className: "bg-green-back" },
  { href: "/", label: "ダミー", className: "bg-gray-back" },
  { href: "/", label: "ダミー", className: "bg-red-back" },
  { href: "/", label: "ダミー", className: "bg-blue-back" },
  { href: "/", label: "ダミー", className: "bg-yellow-back" },
  { href: "/", label: "ダミー", className: "bg-green-back" },
];

export default function Home() {
  return (
    <main>
      <div className="bg-gray-back h-96 w-full"></div>
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
