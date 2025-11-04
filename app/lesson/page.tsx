import data from "@/lib/英検_2級_頻出_200.json";

// 型定義
type OtherTranslation = {
  translation?: string;
  part_of_speech?: string;
};

type OtherExample = {
  english?: string;
  translation?: string;
};

type Derivative = {
  english?: string;
  part_of_speech?: string;
  translation?: string;
};

type Antonym = {
  english?: string;
  part_of_speech?: string;
  translation?: string;
};

type Phrase = {
  english?: string;
  translation?: string;
};

type Synonym = {
  english?: string;
  description?: string;
};

type JsonData = {
  english?: string;
  pronunciation?: string;
  other_translations?: OtherTranslation[];
  other_examples?: OtherExample[];
  derivatives?: Derivative[];
  antonyms?: Antonym[];
  phrases?: Phrase[];
  synonyms?: Synonym[];
  english_meaning?: string;
};

type Item = {
  id: string;
  english: string;
  translation?: string;
  part_of_speech?: string;
  course?: string;
  importance?: number;
  example?: string;
  example_translation?: string;
  sound?: string;
  json?: JsonData;
};

// 変換辞書
const posMap: Record<string, string> = {
  noun: "名",
  adjective: "形",
  verb: "動",
  adverb: "副",
};

// 変換関数
function mapPos(pos?: unknown): string | undefined {
  if (typeof pos !== "string") return undefined;
  return posMap[pos.toLowerCase()] ?? pos;
}

// 型チェック
function normalize(raw: any): Item | null {
  if (!raw || typeof raw.id !== "string" || typeof raw.english !== "string")
    return null;

  const importance =
    typeof raw.importance === "number"
      ? raw.importance
      : typeof raw.importance === "string" && /^\d+$/.test(raw.importance)
      ? parseInt(raw.importance, 10)
      : undefined;

  const json: JsonData | undefined =
    raw && typeof raw.json === "object" && raw.json !== null
      ? raw.json
      : undefined;

  return {
    id: raw.id,
    english: raw.english,
    translation:
      typeof raw.translation === "string" ? raw.translation : undefined,
    example: typeof raw.example === "string" ? raw.example : undefined,
    example_translation:
      typeof raw.example_translation === "string"
        ? raw.example_translation
        : undefined,
    part_of_speech: mapPos(raw.part_of_speech),
    course: typeof raw.course === "string" ? raw.course : undefined,
    importance,
    sound: typeof raw.sound === "string" ? raw.sound : undefined,
    json,
  };
}

const items: Item[] = Array.isArray(data)
  ? data.map(normalize).filter((v): v is Item => v !== null)
  : [];

export default function lessonPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">英検2級 - 頻出200</h1>
      <p className="text-sm text-gray-600 mb-6">
        一覧：id / English / 日本語訳 / 例文 / 例文の訳
      </p>

      <ul className="space-y-4">
        {items.length > 0 ? (
          items.map((item) => (
            <li
              key={item.id}
              className="p-4 bg-white rounded-lg shadow-sm border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">ID: {item.id}</span>
                <span className="text-xs text-gray-400 capitalize">
                  {item.part_of_speech}
                </span>
              </div>

              <div className="text-lg font-semibold text-gray-900">
                {item.english}
              </div>
              <div className="text-base text-gray-700">{item.translation}</div>

              <div className="mt-2 text-sm italic text-gray-600">
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
    </main>
  );
}
