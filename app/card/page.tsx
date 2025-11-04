import data from "@/lib/英検_2級_頻出_200.json";

type Item = {
  id: string;
  english: string;
  translation?: string;
  example?: string;
  example_translation?: string;
  part_of_speech?: string;
};

const items = data as unknown as Item[];

export default function cardPage() {
  return (
    <main>
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-2 text-2xl font-bold">英検2級 - 頻出200</h1>
        <p className="mb-6 text-sm text-gray-600">
          一覧：id / English / 日本語訳 / 例文 / 例文の訳
        </p>

        <ul className="space-y-4">
          {items.length > 0 ? (
            items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500">ID: {item.id}</span>
                  <span className="text-xs text-gray-400 capitalize">
                    {item.part_of_speech}
                  </span>
                </div>

                <div className="text-lg font-semibold text-gray-900">
                  {item.english}
                </div>
                <div className="text-base text-gray-700">
                  {item.translation}
                </div>

                <div className="mt-2 text-sm text-gray-600 italic">
                  例: {item.example}
                </div>
                <div className="text-sm text-gray-500">
                  訳: {item.example_translation}
                </div>
              </li>
            ))
          ) : (
            <li className="text-gray-600">データがありません</li>
          )}
        </ul>
      </div>
    </main>
  );
}
