"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import defaultData from "@/lib/new_9184.json";

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
  idiom: "熟",
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
  unknown: "bg-red-back text-red-fore",
  learning: "bg-blue-back text-blue-fore",
  review: "bg-yellow-back text-yellow-fore",
  known: "bg-green-back text-green-fore",
  done: "bg-gray-back text-gray-fore",
};

const LOCAL_STORAGE_KEY = "wordStatuses";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function normalizeItems(raw: any[]): Item[] {
  return (raw as unknown as Item[]).map((item) => ({
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
}

// 既定データ（フォールバック）
const defaultItems: Item[] = normalizeItems(defaultData as any);

// 利用可能なデータセット一覧（必要に応じて追加）
const DATASETS: Record<
  string,
  { label: string; loader: () => Promise<{ default: any }> }
> = {
  new9184: {
    label: "全9184語",
    loader: async () => import("@/lib/new_9184.json"),
  },
  "eiken-2-freq-200": {
    label: "英検-2級-頻出200語",
    loader: async () => import("@/lib/英検_2級_頻出_200.json"),
  },
};

function renderPipeText(text?: string | null) {
  if (!text) return null;
  const parts = text.split(/(\|[^|]+\|)/g);
  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith("|") && part.endsWith("|")) {
      const inner = part.slice(1, -1);
      return (
        <span key={idx} className="text-indigo-fore font-medium">
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
        <div key={idx} className="ml-2 sm:ml-3">
          {renderItem(it, idx)}
        </div>
      ))}
    </div>
  );
}

type WordWithTranslationProps = {
  english?: string;
  translation?: string;
  partOfSpeech?: string;
};

function WordWithTranslation({
  english,
  translation,
  partOfSpeech,
}: WordWithTranslationProps) {
  return (
    <div>
      <span className="font-medium">{renderPipeText(english)}</span>
      {translation && (
        <span className="ml-2">{renderPipeText(translation)}</span>
      )}
      {partOfSpeech && (
        <span className="text-gray-fore ml-2 text-xs select-none">
          ({partOfSpeech})
        </span>
      )}
    </div>
  );
}

type FilterButtonProps = {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
};

function FilterButton({ label, count, isActive, onClick }: FilterButtonProps) {
  return (
    <button
      className={cx(
        "border-fore rounded border px-3 py-1 text-sm whitespace-nowrap select-none hover:cursor-pointer",
        isActive
          ? "bg-indigo-600 text-white ring-2 ring-indigo-300 hover:bg-indigo-700"
          : "bg-background hover:bg-gray-back",
      )}
      onClick={onClick}
    >
      {label} ({count})
    </button>
  );
}

// 表示モード
type DisplayMode = "detail" | "simple" | "examples";

type ModeButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function ModeButton({ label, isActive, onClick }: ModeButtonProps) {
  return (
    <button
      className={cx(
        "border-fore rounded border px-3 py-1 text-sm whitespace-nowrap select-none hover:cursor-pointer",
        isActive
          ? "bg-indigo-600 text-white ring-2 ring-indigo-300 hover:bg-indigo-700"
          : "bg-background hover:bg-gray-back",
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

type CardItemProps = {
  item: Item;
  revealed: boolean;
  toggleReveal: (id: string) => void;
  status: Status;
  onChangeStatus: (id: string, val: Status) => void;
  onClose: (id: string) => void;
  bulkMoveMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  mode: DisplayMode;
  onChangeItemMode: (id: string, mode: DisplayMode) => void;
  showBottomControls?: boolean;
};

function CardItem({
  item,
  revealed,
  toggleReveal,
  status,
  onChangeStatus,
  onClose,
  bulkMoveMode = false,
  selected = false,
  onToggleSelect,
  mode,
  onChangeItemMode,
  showBottomControls = true,
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
      if (bulkMoveMode) {
        onToggleSelect?.(item.id);
      } else if (!revealed) {
        toggleReveal(item.id);
      }
    }
  };

  const curStatus = status || "unknown";

  return (
    <li
      className={cx(
        "bg-background border-foreground transform rounded-lg border p-2 shadow-sm transition duration-150 active:ring-2 active:ring-indigo-300 sm:p-4",
        revealed
          ? "cursor-text"
          : "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
        bulkMoveMode && selected && "border-indigo-400 ring-2 ring-indigo-400",
      )}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* 例文モードでは開閉で上部余白が変わらないように、開いたときの余白付与を抑制する */}
      <div
        className={
          revealed
            ? cx(mode === "examples" ? undefined : "mb-2")
            : "flex items-center"
        }
      >
        <div
          className={cx(
            "flex gap-3",
            revealed ? "items-start" : "items-center",
          )}
        >
          {mode === "examples" ? (
            !revealed ? (
              <div className="flex flex-col gap-1 text-lg sm:text-xl">
                {item.example && <div>{renderPipeText(item.example)}</div>}
                {item.json?.other_examples?.map((ex, idx) => (
                  <div key={idx}>{renderPipeText(ex.english)}</div>
                ))}
              </div>
            ) : null
          ) : (
            <button
              type="button"
              className={cx(
                "mr-2 text-2xl leading-tight font-semibold sm:text-3xl",
                revealed ? "cursor-text select-text" : "hover:cursor-pointer",
              )}
              onClick={(e) => {
                if (bulkMoveMode) return;
                e.stopPropagation();
                if (!revealed) toggleReveal(item.id);
              }}
              aria-expanded={!!revealed}
            >
              {renderPipeText(item.english)}
            </button>
          )}
        </div>
      </div>

      {revealed && (
        <div className="cursor-text select-text">
          {(mode === "detail" || mode === "simple") && (
            <>
              {item.translation && (
                <div className="mb-4 text-lg">
                  <div>
                    <span className="font-medium">
                      {renderPipeText(item.translation)}
                    </span>
                    {item.part_of_speech && (
                      <span className="text-gray-fore ml-2 text-xs select-none">
                        ({item.part_of_speech})
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-base">
                    <SectionList
                      title=""
                      items={item.json?.other_translations}
                      renderItem={(trans) => (
                        <span>
                          {renderPipeText(trans.translation)}
                          {trans.part_of_speech ? (
                            <span className="text-gray-fore ml-2 text-xs select-none">
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
                      <div className="text-base">
                        {renderPipeText(item.example)}
                      </div>
                    )}
                    {item.example_translation && (
                      <div className="text-base">
                        {renderPipeText(item.example_translation)}
                      </div>
                    )}
                  </div>
                )}

                {item.json?.other_examples?.map((ex, idx) => (
                  <div key={idx}>
                    <div className="text-base">
                      {renderPipeText(ex.english)}
                    </div>
                    <div className="text-base">
                      {renderPipeText(ex.translation)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {mode === "detail" &&
            item.json &&
            ((item.json.derivatives?.length ?? 0) > 0 ||
              (item.json.antonyms?.length ?? 0) > 0 ||
              (item.json.phrases?.length ?? 0) > 0 ||
              (item.json.synonyms?.length ?? 0) > 0) && (
              <div className="mt-3 space-y-2 border-t pt-3 text-base">
                <SectionList
                  title="派生語:"
                  items={item.json.derivatives}
                  renderItem={(d) => (
                    <WordWithTranslation
                      english={d.english}
                      translation={d.translation}
                      partOfSpeech={d.part_of_speech}
                    />
                  )}
                />

                <SectionList
                  title="反意語:"
                  items={item.json.antonyms}
                  renderItem={(a) => (
                    <WordWithTranslation
                      english={a.english}
                      translation={a.translation}
                      partOfSpeech={a.part_of_speech}
                    />
                  )}
                />

                <SectionList
                  title="フレーズ:"
                  items={item.json.phrases}
                  renderItem={(p) => (
                    <div>
                      <div className="font-medium">
                        {renderPipeText(p.english)}
                      </div>
                      <div className="mb-2 text-base">
                        {renderPipeText(p.translation)}
                      </div>
                    </div>
                  )}
                />

                <SectionList
                  title="類義語（説明）:"
                  items={item.json.synonyms}
                  renderItem={(s) => (
                    <div className="text-base">
                      {renderPipeText(s.description)}
                    </div>
                  )}
                />
              </div>
            )}

          {mode === "examples" && (
            <div className="mb-2 space-y-2">
              {(item.example || item.example_translation) && (
                <div>
                  {item.example && (
                    <div className="text-lg sm:text-xl">
                      {renderPipeText(item.example)}
                    </div>
                  )}
                  {item.example_translation && (
                    <div className="text-lg sm:text-xl">
                      {renderPipeText(item.example_translation)}
                    </div>
                  )}
                </div>
              )}

              {item.json?.other_examples?.map((ex, idx) => (
                <div key={idx}>
                  <div className="text-lg sm:text-xl">
                    {renderPipeText(ex.english)}
                  </div>
                  <div className="text-lg sm:text-xl">
                    {renderPipeText(ex.translation)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showBottomControls && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="bg-background border-foreground hover:bg-gray-back rounded border px-3 py-1 text-sm select-none hover:cursor-pointer active:scale-105 active:border-white active:bg-amber-200 active:ring-2 active:ring-indigo-300"
                  disabled={bulkMoveMode}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(item.id);
                  }}
                  aria-label="閉じる"
                >
                  閉じる
                </button>
                {!bulkMoveMode && (
                  <div className="flex items-center gap-1">
                    <ModeButton
                      label="詳細"
                      isActive={mode === "detail"}
                      onClick={() => onChangeItemMode(item.id, "detail")}
                    />
                    <ModeButton
                      label="簡易"
                      isActive={mode === "simple"}
                      onClick={() => onChangeItemMode(item.id, "simple")}
                    />
                    <ModeButton
                      label="例文"
                      isActive={mode === "examples"}
                      onClick={() => onChangeItemMode(item.id, "examples")}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cx(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-sm font-medium select-none",
                    STATUS_BADGE_CLASS[curStatus],
                  )}
                >
                  {STATUS_LABELS[curStatus]}
                </span>
                <select
                  aria-label="ステータス"
                  className="border-fore rounded border px-2 py-1 text-base select-none"
                  value={curStatus}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    if (bulkMoveMode) return;
                    e.stopPropagation();
                    const val = e.target.value as Status;
                    onChangeStatus(item.id, val);
                  }}
                  disabled={bulkMoveMode}
                >
                  <option value="unknown" className="bg-background">
                    未習得
                  </option>
                  <option value="learning" className="bg-background">
                    習得中
                  </option>
                  <option value="review" className="bg-background">
                    復習中
                  </option>
                  <option value="known" className="bg-background">
                    覚えた
                  </option>
                  <option value="done" className="bg-background">
                    もういい
                  </option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

const MemoCardItem = React.memo(CardItem);

const PAGE_SIZE = 20;

// ネストした JSON の型ヘルパー
type JsonData = NonNullable<Item["json"]>;
type OtherTranslation = NonNullable<JsonData["other_translations"]>[number];
type OtherExample = NonNullable<JsonData["other_examples"]>[number];
type Derivative = NonNullable<JsonData["derivatives"]>[number];
type Antonym = NonNullable<JsonData["antonyms"]>[number];
type Phrase = NonNullable<JsonData["phrases"]>[number];
type Synonym = NonNullable<JsonData["synonyms"]>[number];

export default function ListPage() {
  const searchParams = useSearchParams();
  const datasetKey = searchParams.get("set") || "new9184";

  const [datasetLabel, setDatasetLabel] = useState<string>(
    DATASETS[datasetKey]?.label || DATASETS["new9184"].label,
  );
  const [items, setItems] = useState<Item[]>(defaultItems);

  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [filter, setFilter] = useState<"all" | Status | null>(null);
  const [order, setOrder] = useState<string[]>(defaultItems.map((it) => it.id));
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [displayedCount, setDisplayedCount] = useState<number>(PAGE_SIZE);
  const [bulkOpen, setBulkOpen] = useState<boolean>(false);
  const [bulkMoveMode, setBulkMoveMode] = useState<boolean>(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [globalDisplayMode, setGlobalDisplayMode] =
    useState<DisplayMode>("detail");
  const [itemDisplayModes, setItemDisplayModes] = useState<
    Record<string, DisplayMode>
  >({});
  const [showBottomControls, setShowBottomControls] = useState<boolean>(true);

  // データセット切替
  useEffect(() => {
    let mounted = true;
    const ds = DATASETS[datasetKey] || DATASETS["new9184"];
    setDatasetLabel(ds.label);
    ds.loader()
      .then((mod) => {
        if (!mounted) return;
        const next = normalizeItems(mod.default as any);
        setItems(next);
        setOrder(next.map((it) => it.id));
        setRevealed({});
        setDisplayedCount(PAGE_SIZE);
        setBulkOpen(false);
        setSelected({});
        setItemDisplayModes({});
      })
      .catch(() => {
        if (!mounted) return;
        setItems(defaultItems);
        setOrder(defaultItems.map((it) => it.id));
        setDatasetLabel(DATASETS["new9184"].label);
      });
    return () => {
      mounted = false;
    };
  }, [datasetKey]);

  // id -> item のクイック参照（並び替えでの線形探索を避ける）
  const ITEM_BY_ID = useMemo(
    () => Object.fromEntries(items.map((it) => [it.id, it] as const)),
    [items],
  );

  const toggleReveal = useCallback((id: string) => {
    setRevealed((prev) => ({ ...prev, [id]: true }));
  }, []);

  const handleCloseCard = useCallback((id: string) => {
    setRevealed((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
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
    const orderedSet = new Set(orderedVisibleIds);
    const remainingVisible = visibleItems.filter(
      (it) => !orderedSet.has(it.id),
    );
    return [
      ...orderedVisibleIds
        .map((id) => ITEM_BY_ID[id])
        .filter(Boolean as unknown as (v: Item | undefined) => v is Item),
      ...remainingVisible,
    ];
  }, [visibleItems, order, items]);

  // visibleItemsOrdered が変わったときに表示件数をリセットする
  useEffect(() => {
    setDisplayedCount(Math.min(PAGE_SIZE, visibleItemsOrdered.length));
  }, [visibleItemsOrdered]);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
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

  const handleBulkToggle = useCallback(() => {
    const targetIds = visibleItemsOrdered
      .slice(0, displayedCount)
      .map((it) => it.id);

    if (!bulkOpen) {
      setBulkOpen(true);
      setRevealed((prev) => {
        const next = { ...prev };
        for (const id of targetIds) next[id] = true;
        return next;
      });
    } else {
      setBulkOpen(false);
      setRevealed((prev) => {
        const next: Record<string, boolean> = { ...prev };
        for (const id of targetIds) {
          delete next[id];
        }
        return next;
      });
    }
  }, [bulkOpen, visibleItemsOrdered, displayedCount]);

  useEffect(() => {
    if (!bulkOpen) return;
    const idsToShow = new Set(
      visibleItemsOrdered.slice(0, displayedCount).map((it) => it.id),
    );
    setRevealed((prev) => {
      let changed = false;
      const next = { ...prev };
      idsToShow.forEach((id) => {
        if (!next[id]) {
          next[id] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [bulkOpen, displayedCount, visibleItemsOrdered]);

  const handleScrollTop = useCallback(() => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const shuffleOrder = useCallback(() => {
    const visibleIds = visibleItems.map((it) => it.id);
    const arr = [...visibleIds];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const otherIds = order.filter((id) => !visibleIds.includes(id));
    setOrder([...arr, ...otherIds]);
    setBulkOpen(false);
    setRevealed({});
  }, [visibleItems, order]);

  const setFilterAndClose = useCallback((val: "all" | Status | null) => {
    setFilter(val as any);
    setBulkOpen(false);
    setRevealed({});
    setSelected({});
  }, []);

  const toggleBulkMoveMode = useCallback(() => {
    setBulkMoveMode((prev) => !prev);
    setSelected({});
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleFilterClick = useCallback(
    (target: "all" | Status) => {
      if (bulkMoveMode) {
        const ids = Object.keys(selected).filter((k) => selected[k]);
        if (target !== "all" && ids.length > 0) {
          setStatuses((prev) => {
            const next = { ...prev } as Record<string, Status>;
            for (const id of ids) {
              next[id] = target as Status;
            }
            saveStatuses(next);
            return next;
          });
        }
        setFilterAndClose(target);
        setBulkMoveMode(false);
        return;
      }
      setFilterAndClose(target);
    },
    [bulkMoveMode, selected, setFilterAndClose, saveStatuses],
  );

  // CardItem is defined above as a top-level component to reduce re-creation on each render

  return (
    <main>
      <div
        className={cx(
          "mx-auto max-w-4xl px-2 py-6 sm:px-6",
          bulkMoveMode && "select-none",
        )}
      >
        <h1 className="mb-2 text-2xl font-bold">{datasetLabel}</h1>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <FilterButton
            label="全て"
            count={items.length}
            isActive={filter === null || filter === "all"}
            onClick={() => handleFilterClick("all")}
          />

          {STATUS_ORDER.map((status) => (
            <FilterButton
              key={status}
              label={STATUS_LABELS[status]}
              count={counts[status]}
              isActive={filter === status}
              onClick={() => handleFilterClick(status)}
            />
          ))}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {!bulkMoveMode && (
            <button
              className="bg-background border-foreground hover:bg-gray-back rounded border px-3 py-1 text-sm whitespace-nowrap select-none hover:cursor-pointer active:scale-105 active:border-white active:bg-amber-200 active:ring-2 active:ring-indigo-300"
              onClick={() => shuffleOrder()}
            >
              シャッフル
            </button>
          )}
          {!bulkMoveMode && (
            <button
              className="bg-background border-foreground hover:bg-gray-back rounded border px-3 py-1 text-sm whitespace-nowrap select-none hover:cursor-pointer active:scale-105 active:border-white active:bg-amber-200 active:ring-2 active:ring-indigo-300"
              onClick={handleBulkToggle}
            >
              {bulkOpen ? "一括閉じる" : "一括開く"}
            </button>
          )}
          {!(filter === null || filter === "all") && (
            <button
              className="bg-background border-foreground hover:bg-gray-back rounded border px-3 py-1 text-sm whitespace-nowrap select-none hover:cursor-pointer active:scale-105 active:border-white active:bg-amber-200 active:ring-2 active:ring-indigo-300"
              onClick={toggleBulkMoveMode}
            >
              {bulkMoveMode ? "一括移動モード終了" : "一括移動"}
            </button>
          )}
          {!bulkMoveMode && (
            <button
              className="bg-background border-foreground hover:bg-gray-back rounded border px-3 py-1 text-sm whitespace-nowrap select-none hover:cursor-pointer active:scale-105 active:border-white active:bg-amber-200 active:ring-2 active:ring-indigo-300"
              onClick={() => setShowBottomControls((v) => !v)}
              aria-pressed={showBottomControls}
              aria-label="下部操作の表示切替"
              title="開いたカードの下部操作（閉じる・モード・状態）を表示/非表示"
            >
              {showBottomControls ? "操作非表示" : "操作表示"}
            </button>
          )}
        </div>

        {!bulkMoveMode && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <ModeButton
              label="詳細"
              isActive={globalDisplayMode === "detail"}
              onClick={() => {
                setGlobalDisplayMode("detail");
                setItemDisplayModes({});
              }}
            />
            <ModeButton
              label="簡易"
              isActive={globalDisplayMode === "simple"}
              onClick={() => {
                setGlobalDisplayMode("simple");
                setItemDisplayModes({});
              }}
            />
            <ModeButton
              label="例文"
              isActive={globalDisplayMode === "examples"}
              onClick={() => {
                setGlobalDisplayMode("examples");
                setItemDisplayModes({});
              }}
            />
          </div>
        )}

        <ul className="space-y-3 sm:space-y-4">
          {visibleItemsOrdered.length > 0 ? (
            visibleItemsOrdered
              .slice(0, displayedCount)
              .map((item) => (
                <MemoCardItem
                  key={item.id}
                  item={item}
                  revealed={!!revealed[item.id]}
                  toggleReveal={toggleReveal}
                  status={(statuses[item.id] as Status) || "unknown"}
                  onChangeStatus={handleChangeStatus}
                  onClose={handleCloseCard}
                  bulkMoveMode={bulkMoveMode}
                  selected={!!selected[item.id]}
                  onToggleSelect={toggleSelect}
                  mode={itemDisplayModes[item.id] || globalDisplayMode}
                  onChangeItemMode={(id, m) =>
                    setItemDisplayModes((prev) => ({ ...prev, [id]: m }))
                  }
                  showBottomControls={showBottomControls}
                />
              ))
          ) : (
            <li>データがありません</li>
          )}
          {displayedCount < visibleItemsOrdered.length && (
            <li className="text-center text-sm">
              下にスクロールするとさらに読み込みます…
            </li>
          )}
          {visibleItemsOrdered.length > 0 && (
            <li
              role="button"
              tabIndex={0}
              className={cx(
                "bg-background border-foreground transform rounded-lg border p-2 shadow-sm transition duration-150 sm:p-4",
                "cursor-pointer text-center select-none hover:-translate-y-0.5 hover:shadow-md active:ring-2 active:ring-indigo-300",
              )}
              onClick={handleScrollTop}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleScrollTop();
              }}
              aria-label="ページトップへ戻る"
            >
              ページトップへ戻る
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}
