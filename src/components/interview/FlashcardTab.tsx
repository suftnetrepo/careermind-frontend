"use client";
import { useState } from "react";
import type { Flashcard } from "@/types";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Eye,
  Lightbulb,
  MoreHorizontal,
  RotateCcw,
} from "lucide-react";

interface Props {
  cards: Flashcard[];
}

export default function FlashcardTab({ cards }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [studied, setStudied] = useState<Set<number>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());

  if (cards.length === 0) {
    return (
      <p className="py-16 text-center text-gray-400">
        No flashcards available.
      </p>
    );
  }

  const card = cards[index];
  const progress = Math.round((studied.size / cards.length) * 100);
  const remaining = cards.length - studied.size;

  function handleFlip() {
    if (!flipped) setStudied((previous) => new Set(previous).add(index));
    setFlipped((previous) => !previous);
  }

  function goToCard(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= cards.length) return;
    setIndex(nextIndex);
    setFlipped(false);
  }

  function handleRestart() {
    setIndex(0);
    setFlipped(false);
    setStudied(new Set());
  }

  function toggleBookmark() {
    setBookmarked((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="mx-auto grid max-w-[1500px] gap-5 py-3 lg:grid-cols-[250px_minmax(0,1fr)_290px] sm:py-6">
      <aside className="hidden h-fit rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(30,41,59,.05)] lg:block">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2.5 text-lg font-extrabold text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <BookOpen className="h-5 w-5" />
            </span>
            Flashcards ({cards.length})
          </h2>
          <ChevronDown className="h-5 w-5 text-slate-400" />
        </div>
        <div className="mt-5 grid grid-cols-4 gap-2.5">
          {cards.map((_, cardIndex) => {
            const active = index === cardIndex;
            const reviewed = studied.has(cardIndex);
            return (
              <button
                key={cardIndex}
                onClick={() => goToCard(cardIndex)}
                aria-label={`Go to flashcard ${cardIndex + 1}${reviewed ? ", studied" : ""}`}
                aria-current={active ? "step" : undefined}
                className={`flex aspect-square items-center justify-center rounded-xl border text-sm font-extrabold transition ${active ? "border-indigo-600 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200" : reviewed ? "border-emerald-100 bg-emerald-50 text-emerald-600 hover:border-emerald-200" : "border-slate-100 bg-slate-50 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50"}`}
              >
                {cardIndex + 1}
              </button>
            );
          })}
        </div>
        <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-xs font-semibold text-slate-500">
          <p className="flex items-center gap-2">
            <i className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
            Current card
          </p>
          <p className="flex items-center gap-2">
            <i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Reviewed
          </p>
          <p className="flex items-center gap-2">
            <i className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Not studied
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-3 flex items-center justify-between text-sm font-bold text-slate-500">
          <span>
            Card <strong className="text-slate-900">{index + 1}</strong> of{" "}
            {cards.length}
          </span>
          <span>{studied.size} studied</span>
        </div>
        <div className="mb-7 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="group relative flex min-h-[420px] w-full flex-col overflow-hidden rounded-[28px] border border-indigo-100 bg-[radial-gradient(circle_at_100%_0%,rgba(196,181,253,.23),transparent_27%),radial-gradient(circle_at_0%_100%,rgba(191,219,254,.25),transparent_26%),#fff] p-6 text-left shadow-[0_20px_55px_rgba(79,70,229,.08)] transition hover:border-indigo-200 sm:min-h-[500px] sm:p-8">
          <span className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-violet-100/70 blur-2xl" />
          <span className="pointer-events-none absolute -bottom-24 -left-12 h-48 w-64 rounded-full bg-blue-100/70 blur-2xl" />
          <span className="relative flex w-full items-center justify-between gap-3">
            <span className="inline-flex max-w-[75%] items-center gap-2 rounded-full bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-2 text-xs font-extrabold text-violet-700 sm:text-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-violet-600 shadow-sm">
                <Code2 className="h-4 w-4" />
              </span>
              <span className="truncate">{card.topic}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label={
                  bookmarked.has(index) ? "Remove bookmark" : "Bookmark card"
                }
                onClick={toggleBookmark}
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-700 shadow-sm transition hover:text-indigo-600 ${bookmarked.has(index) ? "text-indigo-600" : ""}`}
              >
                <Bookmark
                  className="h-5 w-5"
                  fill={bookmarked.has(index) ? "currentColor" : "none"}
                />
              </button>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-700 shadow-sm">
                <MoreHorizontal className="h-5 w-5" />
              </span>
            </span>
          </span>

          <button
            type="button"
            onClick={handleFlip}
            aria-label={
              flipped ? "Show flashcard question" : "Reveal flashcard answer"
            }
            className="relative flex flex-1 flex-col items-center justify-center py-10 text-center"
          >
            <span className="mb-6 text-xs font-extrabold uppercase tracking-[.2em] text-slate-400">
              {flipped ? "Answer" : "Question"}
            </span>
            {flipped ? (
              <p className="w-full max-w-2xl whitespace-pre-line text-left text-sm font-medium leading-7 tracking-normal text-slate-700 sm:text-base sm:leading-8">
                {card.back}
              </p>
            ) : (
              <p className="max-w-3xl text-lg font-extrabold leading-snug tracking-[-.02em] text-slate-950 sm:text-xl lg:text-2xl">
                {card.front}
              </p>
            )}
            {flipped && card.tip && (
              <span className="mt-6 max-w-2xl rounded-2xl border border-amber-100 bg-amber-50/90 p-4 text-left text-sm leading-6 text-amber-800 sm:p-5">
                <strong className="mb-1 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Study tip
                </strong>
                {card.tip}
              </span>
            )}
          </button>

          <span className="relative flex min-h-14 w-full items-center justify-center gap-3 border-t border-slate-100 text-sm font-semibold text-slate-400">
            <Eye className="h-5 w-5" />
            {flipped ? "Click to see question" : "Click to reveal answer"}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={() => goToCard(index - 1)}
            disabled={index === 0}
            className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-extrabold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          {index < cards.length - 1 ? (
            <button
              onClick={() => goToCard(index + 1)}
              className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-extrabold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleRestart}
              className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-extrabold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5"
            >
              <RotateCcw className="h-4 w-4" />
              Start over
            </button>
          )}
        </div>

        {studied.size === cards.length && (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-green-100 bg-green-50 p-4 text-center text-sm font-bold text-green-700">
            <Check className="h-5 w-5" />
            You&apos;ve studied all {cards.length} cards. Ready to take the
            quiz?
          </div>
        )}
      </div>

      <aside className="space-y-5 lg:sticky lg:top-28 lg:h-fit">
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(30,41,59,.05)] sm:p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <BookOpen className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">
              Your progress
            </h2>
          </div>
          <div className="mt-5 flex justify-center border-b border-slate-100 pb-5">
            <div className="relative h-28 w-28 shrink-0">
              <svg
                width="112"
                height="112"
                viewBox="0 0 112 112"
                className="-rotate-90"
              >
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  fill="none"
                  stroke="#eef2ff"
                  strokeWidth="10"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="10"
                  strokeDasharray="282.7"
                  strokeDashoffset={
                    282.7 - (282.7 * studied.size) / cards.length
                  }
                  strokeLinecap="round"
                  className="transition-all"
                />
              </svg>
              <span className="absolute inset-0 flex flex-col items-center justify-center">
                <strong className="text-2xl font-black text-slate-950">
                  {progress}%
                </strong>
                <span className="text-xs text-slate-400">Studied</span>
              </span>
            </div>
          </div>
          <div className="mt-2 divide-y divide-slate-100">
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="flex items-center gap-2.5 text-sm font-medium text-slate-500"><Check className="h-4 w-4 text-emerald-500" />Reviewed</span>
              <span className="text-sm font-extrabold text-slate-900">{studied.size}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="flex items-center gap-2.5 text-sm font-medium text-slate-500"><i className="h-3.5 w-3.5 rounded-full bg-indigo-500" />Current card</span>
              <span className="text-sm font-extrabold text-slate-900">{index + 1}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="flex items-center gap-2.5 text-sm font-medium text-slate-500"><i className="h-3.5 w-3.5 rounded-full bg-amber-500" />To study</span>
              <span className="text-sm font-extrabold text-slate-900">{remaining}</span>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(30,41,59,.05)] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <Lightbulb className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">
              Tips for this card
            </h2>
          </div>
          <p className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4 text-sm leading-6 text-slate-600 sm:p-5">
            {card.tip ||
              `Think about the key ideas behind ${card.topic}. Try to explain the concept in your own words before revealing the answer.`}
          </p>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(30,41,59,.05)] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <Code2 className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">
              Related topic
            </h2>
          </div>
          <span className="mt-4 inline-flex max-w-full rounded-full bg-indigo-50 px-4 py-2 text-xs font-extrabold text-indigo-600">
            {card.topic}
          </span>
        </section>
      </aside>
    </div>
  );
}
