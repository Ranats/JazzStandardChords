'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">利用規約</h1>
          </div>
        </header>

        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-10 space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">第1条（適用）</h2>
            <p>
              本規約は、本アプリケーション（以下「本アプリ」）の利用者（以下「ユーザー」）が利用する際の条件を定めるものです。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">第2条（知的財産権と出典）</h2>
            <p>
              1. 本アプリのプログラムコードおよび独自のデザインに関する著作権は開発者に帰属します。<br />
              2. 本アプリで表示される楽曲情報（コード進行、楽曲タイトル等）は、学習および個人的な練習を目的とした引用・参照として掲載されています。データは、一般に公開されている公知の情報や各出版社等の資料に基づいています。<br />
              3. データの商用利用や大規模な再配布は禁止します。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">第3条（禁止事項）</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>本アプリの運営を妨げる行為</li>
              <li>自動化ツール（スクレイピング等）による過度な負荷をかける行為</li>
              <li>その他、法令や公序良俗に反する行為</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">第4条（免責事項）</h2>
            <p>
              1. 本アプリの提供する情報の正確性、完全性について開発者は保証しません。<br />
              2. 本アプリの利用によりユーザーに生じた損害（練習成果、機材の故障、データ通信料等を含む）について、開発者は一切の責任を負いません。<br />
              3. 本アプリがリンクしている外部サービス（Amazon、YouTube等）の内容について責任を負いません。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">第5条（サービスの変更・中断）</h2>
            <p>
              開発者は、予告なく本アプリの提供を中断、変更、または終了することがあります。
            </p>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <p className="text-sm text-zinc-500">最終更新日: 2026年3月18日</p>
          </div>
        </section>
      </div>
    </main>
  );
}
