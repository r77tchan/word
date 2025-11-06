import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-bar text-white select-none">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-lg font-bold">
          <Link
            href="/"
            className="block p-4 hover:bg-gray-500 active:bg-gray-500"
          >
            英単語アプリ
          </Link>
        </div>
        <nav className="">
          <ul className="flex">
            <li>
              <Link
                href="/"
                className="block p-4 text-lg hover:bg-gray-500 active:bg-gray-500"
              >
                ログイン
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
