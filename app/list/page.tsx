import data from "@/lib/英検_2級_頻出_200.json";

type Item = {
  id: string;
  english?: string;
  translation?: string;
  part_of_speech?: string;
  course?: string;
  importance?: number;
  example?: string;
  example_translation?: string;
  sound?: string;
  json?: {
    english?: string;
    pronunciation?: string;
    other_translations?: Array<{
      translation: string;
      part_of_speech: string;
    }>;
    other_examples?: Array<{
      english: string;
      translation: string;
    }>;
    derivatives?: Array<{
      english: string;
      part_of_speech: string;
      translation: string;
    }>;
    antonyms?: Array<{
      english: string;
      part_of_speech: string;
      translation: string;
    }>;
    phrases?: Array<{
      english: string;
      translation: string;
    }>;
    synonyms?: Array<{
      english: string;
      description: string;
    }>;
    english_meaning?: string;
  };
};

const items = data as unknown as Item[];

export default function listPage() {
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
                  <div>
                    <span className="mr-2 text-sm text-gray-500">
                      ID: {item.id}
                    </span>
                    {item.importance !== undefined && (
                      <span className="text-sm text-gray-500">
                        重要度: {item.importance}
                      </span>
                    )}
                  </div>
                  <div>
                    {item.part_of_speech && (
                      <span className="mr-2 text-xs text-gray-400 capitalize">
                        {item.part_of_speech}
                      </span>
                    )}
                    {item.course && (
                      <span className="text-xs text-gray-400">
                        {item.course}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  <span className="mr-2 text-lg font-semibold text-gray-900">
                    {item.english}
                  </span>
                  {item.json?.pronunciation && (
                    <span className="text-sm text-gray-600">
                      {item.json.pronunciation}
                    </span>
                  )}
                </div>
                {item.translation && (
                  <div className="mb-4 text-base text-gray-700">
                    {item.translation}
                    {item.json?.other_translations?.map((trans, idx) => (
                      <span key={idx} className="ml-2 text-gray-600">
                        / {trans.translation}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mb-4 space-y-2">
                  {(item.example || item.example_translation) && (
                    <div>
                      {item.example && (
                        <div className="text-sm text-gray-600 italic">
                          例: {item.example}
                        </div>
                      )}
                      {item.example_translation && (
                        <div className="text-sm text-gray-500">
                          訳: {item.example_translation}
                        </div>
                      )}
                    </div>
                  )}
                  {item.json?.other_examples?.map((ex, idx) => (
                    <div key={idx}>
                      <div className="text-sm text-gray-600 italic">
                        例{idx + 2}: {ex.english}
                      </div>
                      <div className="text-sm text-gray-500">
                        訳: {ex.translation}
                      </div>
                    </div>
                  ))}
                </div>

                {item.json &&
                  (item.json.derivatives?.length ||
                    item.json.antonyms?.length ||
                    item.json.phrases?.length ||
                    item.json.synonyms?.length ||
                    item.json.english_meaning) && (
                    <div className="mt-3 space-y-2 border-t pt-3 text-sm">
                      {item.json?.derivatives &&
                        item.json.derivatives.length > 0 && (
                          <div>
                            <span className="font-medium">派生語:</span>
                            {item.json.derivatives.map((d, idx) => (
                              <span key={idx} className="ml-2">
                                {d.english} ({d.translation})
                              </span>
                            ))}
                          </div>
                        )}

                      {item.json?.antonyms && item.json.antonyms.length > 0 && (
                        <div>
                          <span className="font-medium">反意語:</span>
                          {item.json.antonyms.map((a, idx) => (
                            <span key={idx} className="ml-2">
                              {a.english} ({a.translation})
                            </span>
                          ))}
                        </div>
                      )}

                      {item.json?.phrases && item.json.phrases.length > 0 && (
                        <div>
                          <span className="font-medium">フレーズ:</span>
                          {item.json.phrases.map((p, idx) => (
                            <div key={idx} className="ml-2">
                              {p.english} - {p.translation}
                            </div>
                          ))}
                        </div>
                      )}

                      {item.json?.synonyms && item.json.synonyms.length > 0 && (
                        <div>
                          <span className="font-medium">類義語:</span>
                          {item.json.synonyms.map((s, idx) => (
                            <div key={idx} className="ml-2">
                              {s.english} - {s.description}
                            </div>
                          ))}
                        </div>
                      )}

                      {item.json.english_meaning && (
                        <div>
                          <span className="font-medium">英語の意味:</span>
                          <span className="ml-2">
                            {item.json.english_meaning}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
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
