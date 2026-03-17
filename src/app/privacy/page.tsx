'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">プライバシーポリシー</h1>
          </div>
        </header>

        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-10 space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">1. 個人情報の収集</h2>
            <p>
              本アプリケーション（以下「本アプリ」）は、ユーザーの個人を特定できる情報（氏名、住所、メールアドレスなど）を収集しません。
              ただし、本アプリの利便性向上や利用状況把握のために、以下の技術を利用することがあります。
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Cookie（設定の保存など）</li>
              <li>アクセスログ（IPアドレス、ブラウザ情報等）</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">2. 情報の利用目的</h2>
            <p>収集された情報は、以下の目的でのみ利用されます。</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>本アプリの機能提供（テーマ設定の維持など）</li>
              <li>利用状況の統計的分析によるサービスの改善</li>
              <li>セキュリティの確保、不正利用の防止</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">3. 第三者への提供</h2>
            <p>
              法令に基づく場合を除き、取得した情報を本人の同意なく第三者に提供することはありません。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">4. 外部サービスの利用</h2>
            <p>
              本アプリでは、コンテンツ提供のために YouTube（埋め込みプレーヤー）等の外部サービスを利用しています。
              これらのサービスでは各プロバイダー独自のポリシーに基づいて情報が収集される場合があります。詳細は各サービスの規約をご確認ください。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">5. お問い合わせ</h2>
            <p>
              本ポリシーに関するご質問等は、GitHubリポジトリのIssue等を通じてご連絡ください。
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
