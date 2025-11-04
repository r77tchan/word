import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div className="h-96 w-full bg-gray-300"></div>
      <div className="mx-auto h-10 max-w-7xl bg-amber-200"></div>
      <div className="mt-32 flex justify-center gap-5">
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
