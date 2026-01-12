import React, { useState } from 'react';
import './mocks.css';

export const BlogMock = () => {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div className="blog-frame">
      <div className="blog-nav">
        <div className="blog-logo">设计洞察</div>
        <div
          className={`blog-menu ${bookmarked ? 'bookmarked' : ''}`}
          onClick={() => setBookmarked(!bookmarked)}
          style={{ cursor: 'pointer' }}
          title={bookmarked ? "取消收藏" : "收藏文章"}
        >
          {bookmarked ? "★" : "☆"}
        </div>
      </div>

      <div className="blog-category">用户体验</div>
      <h1 className="blog-title">色彩在现代界面设计中的情感共鸣</h1>

      <div className="blog-meta">
        <div className="blog-author-avatar"></div>
        <div className="blog-author-name">莎拉·陈</div>
        <div className="blog-date">2024年10月15日</div>
      </div>

      <div className="blog-article">
        <p className="blog-p">
          正确的配色方案不仅仅是美学选择；它是一种强大的沟通工具。
          通过应用 <span className="blog-highlight">色彩心理学</span>，设计师可以在用户阅读第一个字之前就引发特定的情感反应。
        </p>

        <div className="blog-quote">
          "色彩能够直接触动灵魂。色彩是琴键，眼睛是和声，而灵魂是拥有无数琴弦的钢琴。"
        </div>

        <p className="blog-p">
          在构建设计系统时，我们要确保每个色块都有其独特的语义。主色调传达品牌个性，而语义色则引导用户的操作预期。
        </p>
      </div>

      <div className="blog-tags">
        <span className="blog-tag">设计系统</span>
        <span className="blog-tag">UI/UX</span>
        <span className="blog-tag">色彩理论</span>
      </div>
    </div>
  );
};
