"use client";

import React, { useEffect, useState, useMemo } from "react";
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
      part_of_speech?: string;
    }>;
    other_examples?: Array<{
      english: string;
      translation: string;
    }>;
    derivatives?: Array<{
      english: string;
      part_of_speech?: string;
      translation?: string;
    }>;
    antonyms?: Array<{
      english: string;
      part_of_speech?: string;
      translation?: string;
    }>;
    phrases?: Array<{
      english: string;
      translation?: string;
    }>;
    synonyms?: Array<{
      english?: string;
      description?: string;
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

function mapPosLabel(pos?: string) {
  if (!pos) return undefined;
  return posMap[pos] || pos;
}

const items: Item[] = (data as unknown as Item[]).map((item) => ({
  ...item,
  part_of_speech: mapPosLabel(item.part_of_speech),
  json: item.json
    ? {
        ...item.json,
        derivatives: item.json.derivatives?.map((d) => ({
          ...d,
          part_of_speech: mapPosLabel(d.part_of_speech),
        })),
        other_translations: item.json.other_translations?.map((t) => ({
          ...t,
          part_of_speech: mapPosLabel(t.part_of_speech),
        })),
        antonyms: item.json.antonyms?.map((a) => ({
          ...a,
          part_of_speech: mapPosLabel(a.part_of_speech),
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

type SectionListProps<T> = {
  title: string;
  items?: T[] | null;
  renderItem: (it: T, idx: number) => React.ReactNode;
};

function SectionList<T>({ title, items, renderItem }: SectionListProps<T>) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <span className="font-medium">{title}</span>
      {items.map((it, idx) => (
        <div key={idx} className="ml-3">
          {renderItem(it, idx)}
        </div>
      ))}
    </div>
  );
}

export default function CardPage() {
  type Status = "unknown" | "review" | "known";

  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [filter, setFilter] = useState<"all" | Status | null>(null);
  const [order, setOrder] = useState<string[]>(items.map((it) => it.id));

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wordStatuses") || "{}";
      const obj = JSON.parse(raw) as Record<string, Status>;
      setStatuses(obj || {});
    } catch (e) {
      setStatuses({});
    }
  }, []);

  const saveStatuses = (obj: Record<string, Status>) => {
    try {
      localStorage.setItem("wordStatuses", JSON.stringify(obj));
    } catch (e) {
      // ignore
    }
  };

  const cycleStatus = (id: string) => {
    setStatuses((prev) => {
      const cur = prev[id] || "unknown";
      const nextStatus: Status =
        cur === "unknown" ? "review" : cur === "review" ? "known" : "unknown";
      const next = { ...prev, [id]: nextStatus };
      // if nextStatus is unknown, we can optionally delete the key to keep storage small
      if (nextStatus === "unknown") delete next[id];
      saveStatuses(next);
      return next;
    });
  };

  const getStatusLabel = (s: Status) =>
    s === "unknown" ? "未習得" : s === "review" ? "復習中" : "既に覚えた";

  const counts = useMemo(() => {
    const out: Record<Status, number> = { unknown: 0, review: 0, known: 0 };
    for (const it of items) {
      const s = (statuses[it.id] || "unknown") as Status;
      out[s] = (out[s] || 0) + 1;
    }
    return out;
  }, [items, statuses]);

  const visibleItems = useMemo(() => {
    return items.filter((it) => {
      if (!filter || filter === "all") return true;
      return (statuses[it.id] || "unknown") === filter;
    });
  }, [items, statuses, filter]);

  // order に従って visibleItems を並べ替える
  const visibleItemsOrdered = useMemo(() => {
    const visibleIdSet = new Set(visibleItems.map((it) => it.id));
    const orderedVisibleIds = order.filter((id) => visibleIdSet.has(id));
    const remainingVisible = visibleItems.filter(
      (it) => !orderedVisibleIds.includes(it.id),
    );
    return [
      ...orderedVisibleIds
        .map((id) => items.find((it) => it.id === id)!)
        .filter(Boolean),
      ...remainingVisible,
    ];
  }, [visibleItems, order, items]);

  const shuffleOrder = () => {
    const visibleIds = visibleItems.map((it) => it.id);
    const arr = [...visibleIds];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // keep other (非表示) ids in the same relative order but move shuffled visible ids to front
    const otherIds = order.filter((id) => !visibleIds.includes(id));
    setOrder([...arr, ...otherIds]);
  };

  const resetOrder = () => setOrder(items.map((it) => it.id));

  return (
    <main>
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-2 text-2xl font-bold">英検2級 - 頻出200</h1>

        {/* ステータスでフィルタする UI */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            className={`rounded border px-3 py-1 text-sm ${filter === null || filter === "all" ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}
            onClick={() => setFilter("all")}
          >
            全て ({items.length})
          </button>
          <button
            className={`rounded border px-3 py-1 text-sm ${filter === "unknown" ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}
            onClick={() => setFilter("unknown")}
          >
            未習得 ({counts.unknown})
          </button>
          <button
            className={`rounded border px-3 py-1 text-sm ${filter === "review" ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}
            onClick={() => setFilter("review")}
          >
            復習中 ({counts.review})
          </button>
          <button
            className={`rounded border px-3 py-1 text-sm ${filter === "known" ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}
            onClick={() => setFilter("known")}
          >
            既に覚えた ({counts.known})
          </button>
          {!(filter === "all" || !filter) && (
            <div className="ml-auto text-sm text-gray-600">
              表示中: {getStatusLabel(filter as Status)}
            </div>
          )}
        </div>

        <div className="mb-4 flex items-center gap-2">
          <button
            className="rounded border bg-white px-3 py-1 text-sm text-gray-700"
            onClick={() => shuffleOrder()}
          >
            シャッフル
          </button>
          <button
            className="rounded border bg-white px-3 py-1 text-sm text-gray-700"
            onClick={() => resetOrder()}
          >
            並び順リセット
          </button>
          {items.length - visibleItems.length > 0 && (
            <div className="ml-auto text-sm text-gray-600">
              非表示: {items.length - visibleItems.length}
            </div>
          )}
        </div>

        <ul className="space-y-4">
          {visibleItemsOrdered.length > 0 ? (
            visibleItemsOrdered.map((item) => (
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

                    <div className="mt-1 text-sm text-gray-600">
                      <SectionList
                        title=""
                        items={item.json?.other_translations}
                        renderItem={(trans: any) => (
                          <span>
                            {renderPipeText(trans.translation)}
                            {trans.part_of_speech ? (
                              <span className="ml-1 text-xs text-gray-400">
                                ({trans.part_of_speech})
                              </span>
                            ) : null}
                          </span>
                        )}
                      />
                    </div>
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
                      <SectionList
                        title="派生語:"
                        items={item.json.derivatives}
                        renderItem={(d: any) => (
                          <div>
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
                        )}
                      />

                      <SectionList
                        title="反意語:"
                        items={item.json.antonyms}
                        renderItem={(a: any) => (
                          <div>
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
                        )}
                      />

                      <SectionList
                        title="フレーズ:"
                        items={item.json.phrases}
                        renderItem={(p: any) => (
                          <div>
                            <div className="font-medium">
                              {renderPipeText(p.english)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {renderPipeText(p.translation)}
                            </div>
                          </div>
                        )}
                      />

                      <SectionList
                        title="類義語（説明）:"
                        items={item.json.synonyms}
                        renderItem={(s: any) => (
                          <div className="text-sm text-gray-600">
                            {renderPipeText(s.description)}
                          </div>
                        )}
                      />
                    </div>
                  )}

                <div className="mt-3 flex items-center justify-end gap-2">
                  <div className="text-sm text-gray-600">
                    状態:{" "}
                    {getStatusLabel((statuses[item.id] as Status) || "unknown")}
                  </div>
                  <button
                    className="rounded border px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => cycleStatus(item.id)}
                  >
                    ステータス切替
                  </button>
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
