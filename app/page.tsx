import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div className="flex justify-center mt-32 gap-5">
        <Link href="/lesson" className="bg-red-300 p-4">
          レッスン
        </Link>
        <Link href="/list" className="bg-blue-300 p-4">
          リスト
        </Link>
      </div>
    </main>
  );
}
