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

const posMap: Record<string, string> = {
  noun: "名",
  adjective: "形",
  verb: "動",
  adverb: "副",
  conjunction: "接",
  preposition: "前",
};

const items = (data as unknown as Item[]).map((item) => ({
  ...item,
  part_of_speech: item.part_of_speech
    ? posMap[item.part_of_speech] || item.part_of_speech
    : undefined,
  json: item.json
    ? {
        ...item.json,
        derivatives: item.json.derivatives?.map((d) => ({
          ...d,
          part_of_speech: posMap[d.part_of_speech] || d.part_of_speech,
        })),
        other_translations: item.json.other_translations?.map((t) => ({
          ...t,
          part_of_speech: posMap[t.part_of_speech] || t.part_of_speech,
        })),
        antonyms: item.json.antonyms?.map((a) => ({
          ...a,
          part_of_speech: posMap[a.part_of_speech] || a.part_of_speech,
        })),
      }
    : undefined,
}));

function renderPipeText(text?: string | null) {
  if (!text) return null;
  const parts = text.split(/(\|[^|]+\|)/g);
  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith("|") && part.endsWith("|")) {
      const inner = part.slice(1, -1);
      return (
        <span key={idx} className="font-medium text-indigo-600">
          {inner}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export default function cardPage() {
  return (
    <main>
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-2 text-2xl font-bold">英検2級 - 頻出200</h1>
        <p className="mb-6 text-sm text-gray-600">
          一覧：English / 日本語訳 / 例文 / 例文の訳
        </p>

        <ul className="space-y-4">
          {items.length > 0 ? (
            items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border bg-white p-4 shadow-sm"
              >
                <div className="mb-2">
                  <span className="mr-2 text-lg font-semibold text-gray-900">
                    {renderPipeText(item.english)}
                  </span>
                </div>

                {item.translation && (
                  <div className="mb-4 text-base text-gray-700">
                    <div>
                      <span className="font-medium">
                        {renderPipeText(item.translation)}
                      </span>
                      {item.part_of_speech && (
                        <span className="ml-2 text-xs text-gray-400">
                          ({item.part_of_speech})
                        </span>
                      )}
                    </div>

                    {item.json?.other_translations &&
                      item.json.other_translations.length > 0 && (
                        <div className="mt-1 text-sm text-gray-600">
                          {item.json.other_translations.map((trans, idx) => (
                            <span key={idx}>
                              {renderPipeText(trans.translation)}
                              {trans.part_of_speech ? (
                                <span className="ml-1 text-xs text-gray-400">
                                  ({trans.part_of_speech})
                                </span>
                              ) : null}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                )}

                <div className="mb-4 space-y-2">
                  {(item.example || item.example_translation) && (
                    <div>
                      {item.example && (
                        <div className="text-sm text-gray-600 italic">
                          {renderPipeText(item.example)}
                        </div>
                      )}
                      {item.example_translation && (
                        <div className="text-sm text-gray-500">
                          {renderPipeText(item.example_translation)}
                        </div>
                      )}
                    </div>
                  )}

                  {item.json?.other_examples?.map((ex, idx) => (
                    <div key={idx}>
                      <div className="text-sm text-gray-600 italic">
                        {renderPipeText(ex.english)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {renderPipeText(ex.translation)}
                      </div>
                    </div>
                  ))}
                </div>

                {item.json &&
                  ((item.json.derivatives?.length ?? 0) > 0 ||
                    (item.json.antonyms?.length ?? 0) > 0 ||
                    (item.json.phrases?.length ?? 0) > 0 ||
                    (item.json.synonyms?.length ?? 0) > 0) && (
                    <div className="mt-3 space-y-2 border-t pt-3 text-sm">
                      {item.json?.derivatives &&
                        item.json.derivatives.length > 0 && (
                          <div>
                            <span className="font-medium">派生語:</span>
                            {item.json.derivatives.map((d, idx) => (
                              <div key={idx} className="ml-3">
                                <span className="font-medium">
                                  {renderPipeText(d.english)}
                                </span>
                                {d.translation && (
                                  <span className="ml-2 text-gray-600">
                                    {renderPipeText(d.translation)}
                                  </span>
                                )}
                                {d.part_of_speech && (
                                  <span className="ml-2 text-xs text-gray-400">
                                    ({d.part_of_speech})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                      {item.json?.antonyms && item.json.antonyms.length > 0 && (
                        <div>
                          <span className="font-medium">反意語:</span>
                          {item.json.antonyms.map((a, idx) => (
                            <div key={idx} className="ml-3">
                              <span className="font-medium">
                                {renderPipeText(a.english)}
                              </span>
                              {a.translation && (
                                <span className="ml-2 text-gray-600">
                                  {renderPipeText(a.translation)}
                                </span>
                              )}
                              {a.part_of_speech && (
                                <span className="ml-2 text-xs text-gray-400">
                                  ({a.part_of_speech})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {item.json?.phrases && item.json.phrases.length > 0 && (
                        <div>
                          <span className="font-medium">フレーズ:</span>
                          {item.json.phrases.map((p, idx) => (
                            <div key={idx} className="ml-3">
                              <div className="font-medium">
                                {renderPipeText(p.english)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {renderPipeText(p.translation)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {item.json?.synonyms && item.json.synonyms.length > 0 && (
                        <div>
                          <span className="font-medium">類義語（説明）:</span>
                          {item.json.synonyms.map((s, idx) => (
                            <div
                              key={idx}
                              className="ml-3 text-sm text-gray-600"
                            >
                              {renderPipeText(s.description)}
                            </div>
                          ))}
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
