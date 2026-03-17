import React from 'react';
import { ShoppingBag, ExternalLink } from 'lucide-react';

export default function AmazonLinks() {
  const books = [
    {
      title: 'Jazz Standard Bible 1 (黒本1)',
      subtitle: 'セッションの定番、227曲収録',
      img: 'https://m.media-amazon.com/images/I/71PLNwLqvIL._SL1500_.jpg',
      url: 'https://amzn.to/4rxZbOF',
      price: '¥3,850',
      category: 'Main'
    },
    {
      title: 'Jazz Standard Bible 2 (黒本2)',
      subtitle: 'さらに広がるスタンダード、227曲収録',
      img: 'https://m.media-amazon.com/images/I/61IwQHDc5kL._SL1500_.jpg',
      url: 'https://amzn.to/4bt1xsa',
      price: '¥3,850',
      category: 'Main'
    },
    {
      title: 'ジャズ・スタンダード・セオリー',
      subtitle: '名曲から学ぶジャズ理論の全て',
      img: 'https://m.media-amazon.com/images/I/41RQssAlpuL._SL1000_.jpg',
      url: 'https://amzn.to/4uBkJws',
      category: 'Sub'
    },
    {
      title: 'ジャズ・スタンダード・バイブル in B♭',
      subtitle: 'Bb版はこちら',
      img: 'https://m.media-amazon.com/images/I/61xTqSLh8RL._SL1050_.jpg',
      url: 'https://amzn.to/3Nkv1R3',
      category: 'Sub'
    },
    {
      title: 'ジャズ・スタンダード・バイブル in E♭',
      subtitle: 'Eb版はこちら',
      img: 'https://m.media-amazon.com/images/I/61ZzyCeo4HL._SL1050_.jpg',
      url: 'https://amzn.to/3Pr3Pk6',
      category: 'Sub'
    }
  ];

  return (
    <section className="mt-12 mb-8 px-4">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Recommended Resources</h2>
      </div>

      {/* Horizontal scroll carousel */}
      <div
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'thin' }}
      >
        {books.map((book, i) => (
          <a
            key={i}
            href={book.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex-none w-52 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-md transition-all hover:-translate-y-1 snap-start"
          >
            <div className="h-64 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={book.img}
                alt={book.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur rounded text-[10px] font-bold text-zinc-500 shadow-sm border border-zinc-100 dark:border-zinc-800">
                {book.category}
              </div>
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-indigo-600 transition-colors leading-tight">
                {book.title}
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-3 flex-1">
                {book.subtitle}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{book.price || 'Amazonで見る'}</span>
                <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
              </div>
            </div>
          </a>
        ))}
      </div>

      <p className="mt-2 text-[10px] text-zinc-400 text-center italic">
        ※上記リンクはAmazonアソシエイト・プログラムのリンクとして機能するように設計されています。
      </p>
    </section>
  );
}
