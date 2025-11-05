"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
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

// --- Status types and constants (pulled out for reuse) ---
type Status = "unknown" | "learning" | "review" | "known" | "done";

const STATUS_ORDER: Status[] = [
  "unknown",
  "learning",
  "review",
  "known",
  "done",
];

const STATUS_LABELS: Record<Status, string> = {
  unknown: "未習得",
  learning: "習得中",
  review: "復習中",
  known: "覚えた",
  done: "もういい",
};

const STATUS_BADGE_CLASS: Record<Status, string> = {
  unknown: "bg-red-100 text-red-800",
  learning: "bg-blue-100 text-blue-800",
  review: "bg-yellow-100 text-yellow-800",
  known: "bg-green-100 text-green-800",
  done: "bg-gray-200 text-gray-700",
};

const LOCAL_STORAGE_KEY = "wordStatuses";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
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
      <span className="font-medium select-none">{title}</span>
      {items.map((it, idx) => (
        <div key={idx} className="ml-3">
          {renderItem(it, idx)}
        </div>
      ))}
    </div>
  );
}

type CardItemProps = {
  item: Item;
  revealed: boolean;
  toggleReveal: (id: string) => void;
  statuses: Record<string, Status>;
  onChangeStatus: (id: string, val: Status) => void;
};

function CardItem({
  item,
  revealed,
  toggleReveal,
  statuses,
  onChangeStatus,
}: CardItemProps) {
  const pointerDownRef = React.useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    pointerDownRef.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const start = pointerDownRef.current;
    pointerDownRef.current = null;
    if (!start) return;
    const dx = Math.abs(e.clientX - start.x);
    const dy = Math.abs(e.clientY - start.y);
    if (dx < 6 && dy < 6) {
      if (!revealed) toggleReveal(item.id);
    }
  };

  const curStatus = (statuses[item.id] as Status) || "unknown";

  return (
    <li
      key={item.id}
      className={cx(
        "transform rounded-lg border bg-white p-4 shadow-sm transition duration-150",
        revealed
          ? "cursor-text"
          : "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
      )}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div className="mb-2">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className={cx(
              "mr-2 text-left text-xl leading-tight font-semibold text-gray-900 focus:outline-none sm:text-2xl",
              revealed ? "cursor-text select-text" : "hover:cursor-pointer",
            )}
            style={revealed ? { userSelect: "text" as const } : undefined}
            onClick={(e) => {
              e.stopPropagation();
              if (!revealed) toggleReveal(item.id);
            }}
            aria-expanded={!!revealed}
          >
            {renderPipeText(item.english)}
          </button>
        </div>
      </div>

      {revealed && (
        <div className="cursor-text select-text" style={{ userSelect: "text" }}>
          {item.translation && (
            <div className="mb-4 text-base text-gray-700">
              <div>
                <span className="font-medium">
                  {renderPipeText(item.translation)}
                </span>
                {item.part_of_speech && (
                  <span className="ml-2 text-xs text-gray-400 select-none">
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
                        <span className="ml-1 text-xs text-gray-400 select-none">
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
                        <span className="ml-2 text-xs text-gray-400 select-none">
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
                        <span className="ml-2 text-xs text-gray-400 select-none">
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
            <span
              className={cx(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium select-none",
                STATUS_BADGE_CLASS[curStatus],
              )}
            >
              {STATUS_LABELS[curStatus]}
            </span>
            <select
              aria-label="ステータス"
              className="rounded border bg-white px-2 py-1 text-sm text-gray-700 select-none"
              value={curStatus}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                const val = e.target.value as Status;
                onChangeStatus(item.id, val);
              }}
            >
              <option value="unknown">未習得</option>
              <option value="learning">習得中</option>
              <option value="review">復習中</option>
              <option value="known">覚えた</option>
              <option value="done">もういい</option>
            </select>
          </div>
        </div>
      )}
    </li>
  );
}

export default function ListPage() {
  const PAGE_SIZE = 20;

  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [filter, setFilter] = useState<"all" | Status | null>(null);
  const [order, setOrder] = useState<string[]>(items.map((it) => it.id));
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [displayedCount, setDisplayedCount] = useState<number>(PAGE_SIZE);

  // open only — 再タップで閉じないようにする
  const toggleReveal = useCallback((id: string) => {
    setRevealed((prev) => ({ ...prev, [id]: true }));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY) || "{}";
      const obj = JSON.parse(raw) as Record<string, Status>;
      setStatuses(obj || {});
    } catch (e) {
      setStatuses({});
    }
  }, []);

  const saveStatuses = useCallback((obj: Record<string, Status>) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // ignore
    }
  }, []);

  // handler to update a single status from child components
  const handleChangeStatus = useCallback(
    (id: string, val: Status) => {
      setStatuses((prev) => {
        const next = { ...prev, [id]: val };
        if (val === "unknown") delete next[id];
        saveStatuses(next);
        return next;
      });
    },
    [saveStatuses],
  );

  const counts = useMemo(() => {
    const out: Record<Status, number> = {
      unknown: 0,
      learning: 0,
      review: 0,
      known: 0,
      done: 0,
    };
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

  // order に従って visibleItems を並べ替える（表示順の安定化）
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

  // visibleItemsOrdered が変わったときに表示件数をリセットする
  useEffect(() => {
    setDisplayedCount(Math.min(PAGE_SIZE, visibleItemsOrdered.length));
  }, [visibleItemsOrdered]);

  // 無限スクロール風の読み込み: 画面下部に近づいたら表示件数を増やす
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      // load more when within 300px from bottom
      if (scrollTop + viewportHeight >= fullHeight - 300) {
        setDisplayedCount((prev) => {
          if (prev >= visibleItemsOrdered.length) return prev;
          return Math.min(prev + PAGE_SIZE, visibleItemsOrdered.length);
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [visibleItemsOrdered.length]);

  const shuffleOrder = useCallback(() => {
    const visibleIds = visibleItems.map((it) => it.id);
    const arr = [...visibleIds];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // 表示対象以外の id は相対順を維持しつつ、シャッフルした表示対象を先頭に持ってくる
    const otherIds = order.filter((id) => !visibleIds.includes(id));
    setOrder([...arr, ...otherIds]);
    // シャッフル時には開いているカードを閉じる
    setRevealed({});
  }, [visibleItems, order]);

  // フィルタを切り替える際に開いているカードを閉じるユーティリティ
  const setFilterAndClose = useCallback((val: "all" | Status | null) => {
    setFilter(val as any);
    setRevealed({});
  }, []);

  // CardItem is defined above as a top-level component to reduce re-creation on each render

  return (
    <main>
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-2 text-2xl font-bold">英検-2級-頻出200語</h1>

        {/* ステータスでフィルタするボタン群 */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            className={`rounded border px-3 py-1 text-sm transition-colors duration-150 ease-in-out select-none focus:ring-2 focus:ring-indigo-300 focus:outline-none ${filter === null || filter === "all" ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 active:opacity-90" : "bg-white text-gray-700 hover:bg-gray-50 active:scale-95"}`}
            onClick={() => setFilterAndClose("all")}
          >
            全て ({items.length})
          </button>

          {/* フィルタ順: 未習得 -> 習得中 -> 復習中 -> 覚えた -> もういい */}
          <button
            className={`rounded border px-3 py-1 text-sm transition-colors duration-150 ease-in-out select-none focus:ring-2 focus:ring-indigo-300 focus:outline-none ${filter === "unknown" ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 active:opacity-90" : "bg-white text-gray-700 hover:bg-gray-50 active:scale-95"}`}
            onClick={() => setFilterAndClose("unknown")}
          >
            未習得 ({counts.unknown})
          </button>
          <button
            className={`rounded border px-3 py-1 text-sm transition-colors duration-150 ease-in-out select-none focus:ring-2 focus:ring-indigo-300 focus:outline-none ${filter === "learning" ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 active:opacity-90" : "bg-white text-gray-700 hover:bg-gray-50 active:scale-95"}`}
            onClick={() => setFilterAndClose("learning")}
          >
            習得中 ({counts.learning})
          </button>
          <button
            className={`rounded border px-3 py-1 text-sm transition-colors duration-150 ease-in-out select-none focus:ring-2 focus:ring-indigo-300 focus:outline-none ${filter === "review" ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 active:opacity-90" : "bg-white text-gray-700 hover:bg-gray-50 active:scale-95"}`}
            onClick={() => setFilterAndClose("review")}
          >
            復習中 ({counts.review})
          </button>
          <button
            className={`rounded border px-3 py-1 text-sm transition-colors duration-150 ease-in-out select-none focus:ring-2 focus:ring-indigo-300 focus:outline-none ${filter === "known" ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 active:opacity-90" : "bg-white text-gray-700 hover:bg-gray-50 active:scale-95"}`}
            onClick={() => setFilterAndClose("known")}
          >
            覚えた ({counts.known})
          </button>
          <button
            className={`rounded border px-3 py-1 text-sm transition-colors duration-150 ease-in-out select-none focus:ring-2 focus:ring-indigo-300 focus:outline-none ${filter === "done" ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 active:opacity-90" : "bg-white text-gray-700 hover:bg-gray-50 active:scale-95"}`}
            onClick={() => setFilterAndClose("done")}
          >
            もういい ({counts.done})
          </button>

          {/* 表示中ラベルは表示していません（要望により非表示） */}
        </div>

        <div className="mb-4 flex items-center gap-2">
          <button
            className="transform rounded border bg-white px-3 py-1 text-sm text-gray-700 transition duration-150 ease-in-out select-none hover:bg-gray-50 hover:shadow-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none active:scale-95"
            onClick={() => shuffleOrder()}
          >
            シャッフル
          </button>
          {/* 非表示カウントは表示していません（要望により非表示） */}
        </div>

        <ul className="space-y-4">
          {visibleItemsOrdered.length > 0 ? (
            visibleItemsOrdered
              .slice(0, displayedCount)
              .map((item) => (
                <CardItem
                  key={item.id}
                  item={item}
                  revealed={!!revealed[item.id]}
                  toggleReveal={toggleReveal}
                  statuses={statuses}
                  onChangeStatus={handleChangeStatus}
                />
              ))
          ) : (
            <li className="text-gray-600">データがありません</li>
          )}
          {/* 追加読み込みの案内（スクロールで読み込む場合のヒント） */}
          {displayedCount < visibleItemsOrdered.length && (
            <li className="text-center text-sm text-gray-500">
              下にスクロールするとさらに読み込みます…
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}
